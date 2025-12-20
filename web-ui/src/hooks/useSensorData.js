import { useEffect, useState } from "react";
import { fetchSensors } from "../api/sensors";

const HISTORY_LIMIT = 1000;
const POLL_INTERVAL = 15 * 60 * 1000;

const STORED_VALUES = ['temperature', 'humidity', 'activationTemp', 'deactivationTemp'];

export function useSensorData() {
  const [timestamps, setTimestamps] = useState([]);
  const [sensorData, setSensorData] = useState({});
  const [latestData, setLatestData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const json = await fetchSensors();
        const time = new Date().toLocaleTimeString();

        setLatestData(json);
        setTimestamps((prev) =>
          [...prev, time].slice(-HISTORY_LIMIT)
        );

        setSensorData((prev) => {
          const updated = { ...prev };

          Object.entries(json).forEach(([name, value]) => {
            if (!STORED_VALUES.includes(name)) {
              return;
            }

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

    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return { timestamps, sensorData, latestData };
}
