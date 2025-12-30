import { useState } from "react";

import SensorChart from "./SensorChart";


export default function ChartAndControls({ timestamps, sensorData, clearDataFn }) {

  const [showDataControls, setShowDataControls] = useState(false);
  const [plotActivationTemps, setPlotActivationTemps] = useState(false);

  function confirmClear() {
    const confirmation = window.confirm('Are you sure you want to clear all data?');
    if (confirmation) {
      clearDataFn();
      setShowDataControls(false);
    }
  }

  return (
    <div style={{ marginBottom: '5rem' }}>
      <h2 style={{ textAlign: 'center' }}>Data over time</h2>

      <SensorChart
        timestamps={timestamps}
        sensorData={sensorData}
        plotReferenceLines={plotActivationTemps}
      />

      <div style={{ margin: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <button
          style={{ margin: '0.5rem' }}
          onClick={() => setShowDataControls(!showDataControls)}
        >
          {showDataControls ? 'Hide' : 'Show'} data controls
        </button>

        { showDataControls && (
          <div>
              <span style={{ marginRight: '1rem' }}>Data points: {timestamps.length}</span>
              <button onClick={confirmClear}>Clear data</button>
              <div>
                <label>
                Plot activation temperatures
                  <input
                    name="showActivationTemps"
                    type="checkbox"
                    value={plotActivationTemps}
                    onChange={() => setPlotActivationTemps(!plotActivationTemps)}
                  />
                </label>
              </div>
          </div>
        )}

      </div>
    </div>
  );

}