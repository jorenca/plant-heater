import { round } from "../helpers/math.ts";


export const NIGHT_RATE_HOURS = 8;
export const DAY_RATE_HOURS = 24 - NIGHT_RATE_HOURS;

export function isNightTime(atTime) {
  return atTime.getHours() < 6 || atTime.getHours() >= 22;
}


const MAX_SEGMENT_DURATION_MS = 2 * 60 * 60 * 1000; // discard data from segments (gaps) over 2 hours


export function calculateAverageStats(timestamps, sensorData) {

  if (!timestamps) {
    return {
      averagingPeriod: 0,
      averageTemperature: NaN,
      activeDayHours: NaN,
      activeNightHours: NaN
    };
  }

  // Assume data is sorted by timestamp
  let summedTemperature = 0;
  let summedDurationMs = 0;

  const activeMs = {
    day: {
      on: 0,
      off: 1 // 1 to avoid division by zero
    },
    night: {
      on: 0,
      off: 1
    }
  };

  for (let i=0; i < timestamps.length-1; i++) {
    const segmentStart = timestamps[i];
    const segmentEnd = timestamps[i+1];
    const segmentDurationMs = segmentEnd.getTime() - segmentStart.getTime();

    // Skip long gaps in information
    if (segmentDurationMs > MAX_SEGMENT_DURATION_MS) {
      continue;
    }

    const isNightBefore = isNightTime(segmentStart);
    const isActiveBefore = sensorData.lvHeatPower[i] > 0;
    const isNightLater = isNightTime(segmentEnd);
    const isActiveLater = sensorData.lvHeatPower[i+1] > 0;

    // If one datapoint is active, but the other one isn't, then split the segment duration into both categories
    activeMs[isNightBefore ? 'night' : 'day'][isActiveBefore ? 'on' : 'off'] += segmentDurationMs/2;
    activeMs[isNightLater ? 'night' : 'day'][isActiveLater ? 'on' : 'off'] += segmentDurationMs/2;

    summedTemperature += (sensorData.temperature[i] + sensorData.temperature[i+1])/2 * segmentDurationMs;
    summedDurationMs += segmentDurationMs;
  }

  const activeDayPercentage = activeMs.day.on / (activeMs.day.on+activeMs.day.off);
  const activeNightPercentage = activeMs.night.on / (activeMs.night.on+activeMs.night.off);
  const activePercentage = (activeMs.day.on + activeMs.night.on) / summedDurationMs;

//  console.log(
//    'active percentage', activeNightPercentage,
//    'active on (hours):', activeMs.night.on / 1000 / 60 / 60,
//    'active off (hours):', activeMs.night.off / 1000 / 60 / 60,
//    'total measured (hours):', (activeMs.night.on + activeMs.night.off) / 1000 / 60 / 60
//  );

  return {
    averagingPeriod: summedDurationMs,
    averageTemperature: round(summedTemperature / summedDurationMs, 1),
    activeDayHours: round((24-NIGHT_RATE_HOURS) * activeDayPercentage, 1),
    activeNightHours: round(NIGHT_RATE_HOURS * activeNightPercentage, 1),
    activePercentage
  };
}