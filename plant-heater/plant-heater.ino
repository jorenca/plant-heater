#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>
#include "wifi-config.c"


// --------- DHT / AM2301 Sensor ----------
#define DHTPIN 26        // GPIO pin for sensor
#define DHTTYPE DHT21   // AM2301 = DHT21

DHT dht(DHTPIN, DHTTYPE);

// --------- Web Server ----------
WebServer server(80);

// --------- WiFi Connection Settings ----------
const uint32_t WIFI_TIMEOUT_MS = 5000;


void connectToWiFi() {
  
  Serial.printf("\n[WiFi] Connecting to SSID '%s'\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  uint32_t startAttemptTime = millis();

  while (WiFi.status() != WL_CONNECTED &&
         millis() - startAttemptTime < WIFI_TIMEOUT_MS) {
    Serial.print(".");
    delay(300);
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected!");
    Serial.printf("[WiFi] IP Address: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WiFi] FAILED to connect!");
  }
}


unsigned long lastReconnectAt = 0;

void ensureWiFiConnected()
{
  if (WiFi.status() != WL_CONNECTED) {
    lastReconnectAt = millis();
    Serial.println("\n[WiFi] Connection lost! Attempting reconnect...");
    connectToWiFi();
  }
}

//////////////////////// Temperature and power control

#define HEATING_ACTIVATION_TEMPERATURE 1.5
#define HEATING_DEACTIVATION_TEMPERATURE 2.5

#define MAINS_RELAY_PIN 16
#define POWER_OUT_PWM_PIN 4
#define POWER_OUT_PWM_CHANNEL 0
#define CURRENT_SENSOR_INPUT_PIN 34

// These thresholds can be set arbitrarily (ADC range is 0-4095) and the actual
//  achieved current is set via the trimmer potentiometer on the current sensing board.
#define CURRENT_THRESHOLD_UP 3000
#define CURRENT_THRESHOLD_DOWN (CURRENT_THRESHOLD_UP - 200)


int powerPwmValue = 0;

bool changePowerSetting(int delta) {
  int oldVal = powerPwmValue;

  powerPwmValue += delta;
  powerPwmValue = max(powerPwmValue, 0);
  powerPwmValue = min(powerPwmValue, 255);
  ledcWrite(POWER_OUT_PWM_CHANNEL, powerPwmValue);

  return oldVal != powerPwmValue;
}

bool adjustMaxHeating() {
  digitalWrite(MAINS_RELAY_PIN, 1);
  
  int currentSensorVal = analogRead(CURRENT_SENSOR_INPUT_PIN);
  //Serial.print("Current sense value: "); Serial.println(currentSensorVal);
  
  if (currentSensorVal > CURRENT_THRESHOLD_UP) {
    return changePowerSetting(-1);
  } else if (currentSensorVal < CURRENT_THRESHOLD_DOWN) {
    return changePowerSetting(1);
  }

  return false; // no change
}

void turnOffHeating() {
  changePowerSetting(-255);
  digitalWrite(MAINS_RELAY_PIN, 0);
}

bool heatingActive = false;
long lastOn = 0;

void temperatureControl() {
  
  float temperatureNow = dht.readTemperature();
  // Serial.println(temperatureNow);
  
  if (temperatureNow < HEATING_ACTIVATION_TEMPERATURE) {
    heatingActive = true;
    lastOn = millis();
  } else if (temperatureNow > HEATING_DEACTIVATION_TEMPERATURE) {
    heatingActive = false;
  }

  if (heatingActive) {
    for(int i=0; i<10 && adjustMaxHeating(); i++) {
      delay(100); // wait for a bit for the change to be registered in the current sensor
    }
  } else {
    turnOffHeating();
  }

}


//////////////////////// Web server endpoints


String msFromNowToDateJS = String("function msFromNowToDate(msFromNow) {") +
  "const date = new Date(Date.now() + msFromNow);" +
  "return date.toLocaleString(); }";

String pageTemplate(String content) {
  return String("<html><head><script>") + msFromNowToDateJS + "</script></head>" +
    "<body><div>" + content + "</div></body></html>";
}

void handleRoot() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

//  if (isnan(h) || isnan(t)) {
//    server.send(500, "text/plain", "Sensor read failed");
//    return;
//  }

  String response = "<div>Temperature: " + String(t, 1) + " C</div>" +
                    "<div>Humidity: " + String(h, 1) + " %</div>" +
                    "<div>Low voltage heater power PWM: " + String(100.0 * powerPwmValue / 255.0, 1) + "%<div>" +
                    "<div>Heating active: " + (powerPwmValue > 0 ? "Yes" : "No") + "</div>" +
                    "<div>Last turn on: " + (
                      lastOn > 0
                        ? "<span id='lastOnP' /><script>document.getElementById('lastOnP').textContent = msFromNowToDate(" + String(lastOn - millis()) + ")</script>"
                        : "never"
                    ) + "</div>" +
                    "<div>Last Wi-Fi reconnect: " + (
                      lastReconnectAt > 0
                        ? "<span id='lastCon' /><script>document.getElementById('lastCon').textContent = msFromNowToDate(" + String(lastReconnectAt - millis()) + ")</script>"
                        : "never"
                    ) + "</div><hr/>" +
                    "<div>Activation conditions: Temperature &lt; " + HEATING_ACTIVATION_TEMPERATURE + " C</div>" +
                    "<div>Deactivation conditions: Temperature &gt; " + HEATING_DEACTIVATION_TEMPERATURE + " C</div>";

  server.send(200, "text/html", pageTemplate(response));
}


//////////////////////// main functions

void setup() {
  Serial.begin(115200);
  delay(100);

  dht.begin();

  Serial.println("\n=== Plant Heater Controller ===");
  connectToWiFi();

  // Optional fallback if WiFi fails: start AP mode
  /*
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Starting fallback Access Point mode...");
    WiFi.softAP("ESP32_AP", "12345678");
    Serial.print("[WiFi] AP IP: ");
    Serial.println(WiFi.softAPIP());
  }
  */

  // Server routes
  server.on("/", handleRoot);
  server.begin();
  Serial.println("[HTTP] Server started");

  pinMode(MAINS_RELAY_PIN, OUTPUT);
  digitalWrite(MAINS_RELAY_PIN, 0);

  ledcAttachPin(POWER_OUT_PWM_PIN, POWER_OUT_PWM_CHANNEL); // connect the out pin to PWM internals
  ledcSetup(POWER_OUT_PWM_CHANNEL, 250, 8); // channel 0, PWM at 250hz, 8 bit resolution

  pinMode(CURRENT_SENSOR_INPUT_PIN, INPUT);
  digitalWrite(CURRENT_SENSOR_INPUT_PIN, 0); // make sure no pullup is active


}

void loop() {
  temperatureControl();

  if (lastReconnectAt < (millis() - 60*1000)) {
    ensureWiFiConnected();
  }
  server.handleClient();
  delay(10);
}
