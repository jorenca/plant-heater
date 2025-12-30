import ChartAndControls from "./components/chart/ChartAndControls";
import InformationBoxes from "./components/InformationBoxes";
import PowerCostCalculator from "./components/PowerCostCalculator";

import { useSensorData } from "./hooks/useSensorData";
import { calculateAverageStats } from './stats/averageStats.js';
import { calculateMinimumStats } from './stats/minimumStats.js';

import "./App.css";


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

  const {
    minTemperature: minTemperature24h
  } = calculateMinimumStats(timestamps, sensorData, 24);

  return (
    <div className="app-container">

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
        minTemperature24h={minTemperature24h}
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
