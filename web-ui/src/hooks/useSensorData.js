import { useEffect, useState, useCallback } from "react";
import { fetchSensors } from "../api/sensors";

const HISTORY_LIMIT = 1000;
const POLL_INTERVAL = 15 * 60 * 1000;

const STORED_VALUES = [
  "temperature",
  "humidity",
  "activationTemp",
  "deactivationTemp",
  "lvHeatPower"
];

const STORAGE_KEY = "sensor-data-v1";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days


function loadFromStorage() {
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

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save sensor data to storage", err);
  }
}

export function useSensorData() {
  const stored = loadFromStorage();

  const [timestamps, setTimestamps] = useState(
    stored?.timestamps || []
  );
  const [sensorData, setSensorData] = useState(
    stored?.sensorData || {}
  );
  const [latestData, setLatestData] = useState(
    stored?.latestData || {}
  );

  const fetchData = async () => {
    try {
      const json = await fetchSensors();

      setLatestData(json);
      setTimestamps((prev) =>
        [...prev, json.timestamp].slice(-HISTORY_LIMIT)
      );

      setSensorData((prev) => {
        const updated = { ...prev };

        Object.entries(json).forEach(([name, value]) => {
          if (!STORED_VALUES.includes(name)) return;

          updated[name] = [
            ...(updated[name] || []),
            value,
          ].slice(-HISTORY_LIMIT);
        });

        return updated;
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    saveToStorage({ timestamps, sensorData, latestData });
  }, [timestamps, sensorData, latestData]);

  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTimestamps([]);
    setSensorData({});
    setLatestData({});
    fetchData();
  }, []);

  return {
    timestamps,
    sensorData,
    latestData,
    clearAllData,
  };
}
