import { useEffect, useState, useCallback } from "react";
import { fetchSensors, getMockSensorReport } from "../api/sensors";
import { loadFromStorage, saveToStorage } from "../helpers/localStorage";
import isDevEnv from "../helpers/isDevEnv.ts";


const HISTORY_LIMIT = 2000;
export const STORED_VALUES = [
  "temperature",
  "humidity",
  "activationTemp",
  "deactivationTemp",
  "lvHeatPower"
];

const POLL_INTERVAL_TESTING = 5 * 1000;
const POLL_INTERVAL_PROD = 15 * 60 * 1000; // 15 minutes
const POLL_INTERVAL = isDevEnv() ? POLL_INTERVAL_TESTING : POLL_INTERVAL_PROD;


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
      const json = isDevEnv()
        ? getMockSensorReport(timestamps.length ? timestamps[timestamps.length - 1] : null) // FOR TESTING ONLY
        : await fetchSensors();

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
    setTimestamps([]);
    setSensorData({});
    setLatestData({});
    if (isDevEnv()) {
      window.location.reload(); // discard mock objects state
    } else {
      fetchData();
    }
  }, []);

  return {
    timestamps,
    sensorData,
    latestData,
    clearAllData,
  };
}
