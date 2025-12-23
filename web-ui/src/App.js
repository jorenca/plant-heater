import ChartAndControls from "./components/chart/ChartAndControls";
import InformationBoxes from "./components/InformationBoxes";
import PowerCostCalculator from "./components/PowerCostCalculator";

import { useSensorData } from "./hooks/useSensorData";
import { calculateAverageStats } from './stats/averageStats.js';


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

  if (!timestamps || !temperature) {
    return <div>Loading...</div>;
  }

  const {
    averagingPeriod,
    averageTemperature,
    activeDayHours,
    activeNightHours,
    activePercentage
  } = calculateAverageStats(timestamps, sensorData);

  return (
    <div style={{ width: "900px", margin: "1rem auto" }}>

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
        averageTemperature={averageTemperature}
        averagingPeriod={averagingPeriod}
        heatingActivePercentage={activePercentage}
        timestamp={timestamps[timestamps.length-1]}
      />

      <ChartAndControls
        timestamps={timestamps}
        sensorData={sensorData}
        clearDataFn={() => clearAllData() }
      />

      <PowerCostCalculator
        dayHoursEstimate={activeDayHours}
        nightHoursEstimate={activeNightHours}
      />

    </div>
  );
}

export default App;
