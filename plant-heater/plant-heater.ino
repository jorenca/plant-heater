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



void handleRoot() {

  String indexContent = String("<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"/><title>Plant Heater Interface</title><link href=\"https://jorenca.github.io/plant-heater/static/css/main.chunk.css\" rel=\"stylesheet\"></head><body><noscript>You need to enable JavaScript to run this app.</noscript><div id=\"root\"></div><script>!function(e){function r(r){for(var n,i,l=r[0],f=r[1],a=r[2],c=0,s=[];c<l.length;c++)i=l[c],Object.prototype.hasOwnProperty.call(o,i)&&o[i]&&s.push(o[i][0]),o[i]=0;for(n in f)Object.prototype.hasOwnProperty.call(f,n)&&(e[n]=f[n]);for(p&&p(r);s.length;)s.shift()();return u.push.apply(u,a||[]),t()}function t(){for(var e,r=0;r<u.length;r++){for(var t=u[r],n=!0,l=1;l<t.length;l++){var f=t[l];0!==o[f]&&(n=!1)}n&&(u.splice(r--,1),e=i(i.s=t[0]))}return e}var n={},o={1:0},u=[];function i(r){if(n[r])return n[r].exports;var t=n[r]={i:r,l:!1,exports:{}};return e[r].call(t.exports,t,t.exports,i),t.l=!0,t.exports}i.m=e,i.c=n,i.d=function(e,r,t){i.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:t})},i.r=function(e){\"undefined\"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:\"Module\"}),Object.defineProperty(e,\"__esModule\",{value:!0})},i.t=function(e,r){if(1&r&&(e=i(e)),8&r)return e;if(4&r&&\"object\"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(i.r(t),Object.defineProperty(t,\"default\",{enumerable:!0,value:e}),2&r&&\"string\"!=typeof e)for(var n in e)i.d(t,n,function(r){return e[r]}.bind(null,n));return t},i.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(r,\"a\",r),r},i.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},i.p=\"/\";var l=this[\"webpackJsonpir-hub-web-ui\"]=this[\"webpackJsonpir-hub-web-ui\"]||[],f=l.push.bind(l);l.push=r,l=l.slice();for(var a=0;a<l.length;a++)r(l[a]);var p=f;t()}([])</script><script src=\"https://jorenca.github.io/plant-heater/static/js/2.chunk.js\"></script><script src=\"https://jorenca.github.io/plant-heater/static/js/main.chunk.js\"></script></body></html>");
  
  server.send(200, "text/html", indexContent);
}


void handleReport() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

//  if (isnan(h) || isnan(t)) {
//    server.send(500, "text/plain", "Sensor read failed");
//    return;
//  }

  String response = String("{\n") +
  "  \"temperature\": " + String(t, 1) + ",\n" +
  "  \"humidity\": " + String(h, 1) + ",\n" +
  "  \"lvHeatPower\": " + String(100.0 * powerPwmValue / 255.0, 1) + ",\n" +
  "  \"hvHeatPower\": " + (powerPwmValue > 0 ? 100 : 0) + ",\n" +
  "  \"uptimeMillis\": " + millis() + ",\n" +
  "  \"lastHeatOn\": " + lastOn + ",\n" +
  "  \"lastReconnect\": " + lastReconnectAt + ",\n" +
  "  \"activationTemp\": " + HEATING_ACTIVATION_TEMPERATURE + ",\n" +
  "  \"deactivationTemp\": " + HEATING_DEACTIVATION_TEMPERATURE + "\n" +
  "}";

  server.send(200, "text/json", response);
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
  server.on("/report", handleReport);
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
