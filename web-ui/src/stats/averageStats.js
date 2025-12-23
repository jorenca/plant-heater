const NIGHT_HOURS = 8;


function isNightTime(atTime) {
  return atTime.getHours() < 6 || atTime.getHours() >= 22;
}

function isNightHours(segmentStart, segmentEnd) {
  return isNightTime(segmentStart) && isNightTime(segmentEnd);
}


const MAX_SEGMENT_DURATION_MS = 2 * 60 * 60 * 1000;


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

  let activeDayMs = 0;
  let inactiveDayMs = 1; // 1 to avoid division by zero
  let activeNightMs = 0;
  let inactiveNightMs = 1;

  for (let i=0; i < timestamps.length-1; i++) {
    const segmentStart = timestamps[i];
    const segmentEnd = timestamps[i+1];
    const segmentDurationMs = segmentEnd.getTime() - segmentStart.getTime();

    // Skip long gaps in information
    if (segmentDurationMs > MAX_SEGMENT_DURATION_MS) {
      continue;
    }

    const isNight = isNightHours(segmentStart, segmentEnd);

    if (sensorData.lvHeatPower[i] > 0) {
      if (isNight) {
        activeNightMs += segmentDurationMs;
      } else {
        activeDayMs += segmentDurationMs;
      }
    } else {
      if (isNight) {
        inactiveNightMs += segmentDurationMs;
      } else {
        inactiveDayMs += segmentDurationMs;
      }
    }

    summedTemperature += sensorData.temperature[i] * segmentDurationMs;
    summedDurationMs += segmentDurationMs;
  }

  return {
    averagingPeriod: summedDurationMs,
    averageTemperature: Math.round(10 * summedTemperature / summedDurationMs) / 10,
    activeDayHours: Math.round(10 * (24-NIGHT_HOURS) * activeDayMs / (activeDayMs+inactiveDayMs)) / 10,
    activeNightHours: Math.round(10 * NIGHT_HOURS * activeNightMs / (activeNightMs+inactiveNightMs)) / 10,
    activePercentage: (activeDayMs + activeNightMs) / (activeDayMs + activeNightMs + inactiveDayMs + inactiveNightMs)
  };
}