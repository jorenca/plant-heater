import { round } from "../helpers/math.ts";



export function calculateMinimumStats(timestamps, sensorData, thresholdHoursAgo) {

  if (!timestamps || !sensorData) {
    return {
      minTemperature: NaN
    };
  }

  const pastThreshold = new Date(new Date().getTime() - thresholdHoursAgo * 60 * 60 * 1000);

  const temps = sensorData.temperature
    .filter((d, i) => timestamps[i] > pastThreshold);

  return {
    minTemperature: round(Math.min(temps), 1)
  };
}