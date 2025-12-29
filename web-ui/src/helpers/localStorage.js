
const STORAGE_KEY = "sensor-data-v1";
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days


export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const cutoff = Date.now() - MAX_AGE_MS;

    const validIndexes = parsed.timestamps
      .map((ts, idx) => ({ ts: new Date(ts), idx }))
      .filter(({ ts }) => ts.getTime() >= cutoff)
      //.sort((a, b) => a.ts.getTime() - b.ts.getTime())
      .map(({ idx }) => idx);

    const filteredTimestamps = validIndexes.map(
      (i) => new Date(parsed.timestamps[i])
    );

    const filteredSensorData = {};
    Object.entries(parsed.sensorData || {}).forEach(([key, values]) => {
      filteredSensorData[key] = validIndexes.map((i) => values[i]);
    });

    return {
      timestamps: filteredTimestamps,
      sensorData: filteredSensorData,
      latestData: parsed.latestData || {},
    };
  } catch (err) {
    console.error("Failed to load sensor data from storage", err);
    return null;
  }
}

export function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save sensor data to storage", err);
  }
}