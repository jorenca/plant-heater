import SensorChart from "./components/SensorChart";
import { useSensorData } from "./hooks/useSensorData";

function App() {
  const { timestamps, sensorData, latestData } = useSensorData();
  const {
    temperature,
    humidity,
    activationTemp,
    deactivationTemp,
    lvHeatPower,
    hvHeatPower,
    uptimeMillis,
    lastHeatOn,
    lastReconnect
  } = latestData;
  const latestI = timestamps.length -1;

  return (
    <div style={{ width: "900px", margin: "40px auto" }}>

      <h2>Sensor Data</h2>

      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div>Temperature: {temperature} °C</div>
        <div>Humidity: {humidity}%</div>
        <div>Low-voltage heating: {lvHeatPower > 0 ? lvHeatPower + '%' : 'Off'}</div>
        <div>Mains heating: {hvHeatPower > 0 ? 'On' : 'Off'}</div>

        <div style={{marginTop: '10px'}}></div>
        <div>Latest data from: {timestamps[latestI]}</div>
        <div>Last heat activation: {lastHeatOn > 0 ? new Date(new Date() - uptimeMillis + lastHeatOn).toLocaleString() : 'never'}</div>
        <div>Last WiFi reconnect: {lastReconnect > 0 ? new Date(new Date() - uptimeMillis + lastReconnect).toLocaleString() : 'never'}</div>

        <div style={{marginTop: '10px'}}>Constants:</div>
        <div>Activation temperature: {activationTemp} °C</div>
        <div>Deactivation temperature: {deactivationTemp} °C</div>
      </div>

      <h2>Data over time</h2>
      <SensorChart
        timestamps={timestamps}
        sensorData={sensorData}
      />

    </div>
  );
}

export default App;
