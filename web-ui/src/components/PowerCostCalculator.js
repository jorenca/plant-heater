import { useState, useMemo, useEffect } from "react";

import { DAY_RATE_HOURS, NIGHT_RATE_HOURS } from "../stats/averageStats";

import "./PowerCostCalculator.css";


const EUR_TO_BGN = 1.95583;


export default function PowerCostCalculator({ dayHoursEstimate, nightHoursEstimate }) {

  const [heatingPower, setHeatingPower] = useState(600); // watts
  const [idlePower, setIdlePower] = useState(5); // watts

  const [dayHeatingHours, setDayHeatingHours] = useState(2);
  const [nightHeatingHours, setNightHeatingHours] = useState(4);

  const [dayRate, setDayRate] = useState(0.124);   // €/kWh
  const [nightRate, setNightRate] = useState(0.075); // €/kWh

  useEffect(() => {
    setDayHeatingHours(dayHoursEstimate);
    setNightHeatingHours(nightHoursEstimate);
  }, [dayHoursEstimate, nightHoursEstimate]);

  const results = useMemo(() => {
    const dayHeatingKWh =
      (heatingPower / 1000) * dayHeatingHours;
    const nightHeatingKWh =
      (heatingPower / 1000) * nightHeatingHours;

    const idleHours =
      24 - dayHeatingHours - nightHeatingHours;

    const idleKWh =
      (idlePower / 1000) * Math.max(idleHours, 0);

    const dayCost = dayHeatingKWh * dayRate;
    const nightCost = nightHeatingKWh * nightRate;

    const dailyCost = dayCost + nightCost;
    const monthlyCost = dailyCost * 30;

    return {
      dayHeatingKWh,
      nightHeatingKWh,
      idleKWh,
      dailyCost,
      monthlyCost,
    };
  }, [
    heatingPower,
    idlePower,
    dayHeatingHours,
    nightHeatingHours,
    dayRate,
    nightRate,
  ]);

  return (
    <>
      <h2>Power Usage Calculator</h2>

      <div className='cost-calculator-estimates'>
        <div>Heating hours estimate: {dayHoursEstimate} hours at day rate, {nightHoursEstimate} hours at night rate.</div>
      </div>

      <div className='cost-calculator-row'>

        <div className='cost-calculator-fields'>

          <label>
            Heating power (W)
            <input
              type="number"
              min={1}
              value={heatingPower}
              onChange={(e) => setHeatingPower(+e.target.value)}
            />
          </label>

          <label>
            Idle power (W)
            <input
              type="number"
              min={1}
              value={idlePower}
              onChange={(e) => setIdlePower(+e.target.value)}
            />
          </label>

          <label>
            Daytime heating (hours)
            <input
              type="number"
              step="0.1"
              min={0}
              max={DAY_RATE_HOURS}
              value={dayHeatingHours}
              onChange={(e) =>
                setDayHeatingHours(+e.target.value)
              }
            />
          </label>

          <label>
            Nighttime heating (hours)
            <input
              type="number"
              step="0.1"
              min={0}
              max={NIGHT_RATE_HOURS}
              value={nightHeatingHours}
              onChange={(e) =>
                setNightHeatingHours(+e.target.value)
              }
            />
          </label>


          <label>
            Day rate (€/kWh)
            <input
              type="number"
              step="0.01"
              min={0.01}
              value={dayRate}
              onChange={(e) => setDayRate(+e.target.value)}
            />
          </label>

          <label>
            Night rate (€/kWh)
            <input
              type="number"
              step="0.01"
              min={0.01}
              value={nightRate}
              onChange={(e) => setNightRate(+e.target.value)}
            />
          </label>
        </div>

        <div className='cost-calculator-result'>
          <strong>Estimated cost:</strong>
          <div>Daily: €{results.dailyCost.toFixed(2)} / {(results.dailyCost * EUR_TO_BGN).toFixed(2)} лв.</div>
          <div>Monthly: €{results.monthlyCost.toFixed(2)} / {(results.monthlyCost * EUR_TO_BGN).toFixed(2)} лв.</div>
        </div>
      </div>
    </>
  );
}
