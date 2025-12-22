
import ChartAndControls from "./components/ChartAndControls";
import InformationBoxes from "./components/InformationBoxes";
import { useSensorData } from "./hooks/useSensorData";



function App() {
  const { timestamps, sensorData, latestData, clearAllData } = useSensorData();
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

  return (
    <div style={{ width: "900px", margin: "40px auto" }}>

      <InformationBoxes
        temperature={Math.round(temperature*10)/10}
        humidity={Math.round(humidity*10)/10}
        activationTemp={activationTemp}
        deactivationTemp={deactivationTemp}
        lvHeatPower={Math.round(lvHeatPower)}
        hvHeatPower={Math.round(hvHeatPower)}
        uptimeMillis={uptimeMillis}
        lastReconnect={lastReconnect}
        lastHeatOn={lastHeatOn}
        timestamp={timestamps[timestamps.length-1]}
      />

      <ChartAndControls timestamps={timestamps} sensorData={sensorData} clearDataFn={clearAllData} />

    </div>
  );
}

export default App;
