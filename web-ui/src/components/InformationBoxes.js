import './InformationBoxes.css';


export const HEATING_INDICATION_COLOR = 'rgba(194, 139, 203, 0.5)';


function formatDurationMs(ms) {

  let totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400); // 86400 = 24*60*60
  totalSeconds %= 86400;

  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;

  const minutes = Math.floor(totalSeconds / 60);

  const parts = [];
  if (days) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);

  return parts.join(", ");
}


export default function InformationBoxes({
  temperature,
  humidity,
  uptimeMillis,
  lastHeatOn,
  lastReconnect,
  lvHeatPower,
  hvHeatPower,
  activationTemp,
  deactivationTemp,
  averageTemperature,
  minTemperature24h,
  heatingActivePercentage,
  averagingPeriod,
  timestamp
}) {

  return (
    <>
      <div className='info-boxes-container'>
        <div style={{ textAlign: 'center', margin: '5rem' }}>
          <div style={{ fontWeight: 'bold', fontSize: 'xxx-large' }}>
            {temperature} °C
          </div>
          <div>{humidity}% RH</div>
          <div>{timestamp.toLocaleString()}</div>

          <div className='heating-info'>
            <div style={{ backgroundColor: lvHeatPower > 0 ? HEATING_INDICATION_COLOR : 'unset' }}>
              Low-voltage heaters: { lvHeatPower > 0
                ? <span >On ({lvHeatPower} %)</span>
                : <span>Off</span>
              }
            </div>
            <div style={{ backgroundColor: hvHeatPower > 0 ? HEATING_INDICATION_COLOR : 'unset' }}>
              Mains heaters: { hvHeatPower > 0 ? 'On' : 'Off' }
            </div>
          </div>
        </div>

        <div className='info-row'>
          <fieldset>
            <legend>Statistics</legend>

            <div>Lowest temperature (last 24 hours): {minTemperature24h} °C</div>
            <div>Last heating started on {lastHeatOn > 0 ? new Date(new Date() - uptimeMillis + lastHeatOn).toLocaleString() : 'never'}</div>
            <div>Heating active {Math.round(100 * heatingActivePercentage)}% of the day.</div>
            <div>Average daily temperature: {averageTemperature} °C</div>
            <div>Showing {formatDurationMs(averagingPeriod)} of data.</div>
          </fieldset>

          <fieldset>
            <legend>System</legend>
            <div>Controller uptime: {formatDurationMs(uptimeMillis)}</div>
            <div>Last WiFi reconnect: {lastReconnect > 0 ? new Date(new Date() - uptimeMillis + lastReconnect).toLocaleString() : 'never'}</div>
            <div>Heating activates below {activationTemp} °C</div>
            <div>Heating deactivates above {deactivationTemp} °C</div>
          </fieldset>
        </div>
      </div>
    </>
  );

}