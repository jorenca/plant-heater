import { useState } from "react";

import SensorChart from "./SensorChart";


export default function ChartAndControls({ timestamps, sensorData, clearDataFn }) {

  const [showDataControls, setShowDataControls] = useState(false);

  function confirmClear() {
    const confirmation = window.confirm('Are you sure you want to clear all data?');
    if (confirmation) {
      clearDataFn();
      setShowDataControls(false);
    }
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Data over time</h2>

      <SensorChart
        timestamps={timestamps}
        sensorData={sensorData}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <button onClick={() => setShowDataControls(!showDataControls)}>
          {showDataControls ? 'Hide' : 'Show'} data controls
        </button>

        <div style={{ margin: '1rem' }} />

        { showDataControls && (
          <>
            <span>Data points: {timestamps.length}</span>
            <button onClick={confirmClear}>Clear data</button>
          </>
        )}

      </div>
    </div>
  );

}