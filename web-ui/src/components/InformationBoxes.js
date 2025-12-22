

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
  timestamp
}) {

  return (
    <>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{ textAlign: 'center', margin: '5rem' }}>
          <div style={{ fontWeight: 'bold', fontSize: 'xxx-large' }}>
            {temperature} °C
          </div>
          <div>{humidity}% RH</div>
          <div>{timestamp.toLocaleString()}</div>
        </div>

        <div style={{ margin: '0 5rem 5rem 5rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <fieldset>
            <legend>Heating</legend>

            <div style={{ backgroundColor: lvHeatPower > 0 ? 'lightgreen' : 'unset' }}>
              Low-voltage: { lvHeatPower > 0
                ? <span >On ({lvHeatPower} %)</span>
                : <span>Off</span>
              }
            </div>
            <div style={{ backgroundColor: hvHeatPower > 0 ? 'lightgreen' : 'unset' }}>
              Mains: { hvHeatPower > 0 ? 'On' : 'Off' }
            </div>

            <div>Last active: {lastHeatOn > 0 ? new Date(new Date() - uptimeMillis + lastHeatOn).toLocaleString() : 'never'}</div>
          </fieldset>

          <fieldset>
            <legend>Configuration</legend>

            <div>Last WiFi reconnect: {lastReconnect > 0 ? new Date(new Date() - uptimeMillis + lastReconnect).toLocaleString() : 'never'}</div>
            <div>Heating activation temperature: {activationTemp} °C</div>
            <div>Heating deactivation temperature: {deactivationTemp} °C</div>
          </fieldset>
        </div>
      </div>
    </>
  );

}