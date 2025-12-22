import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

import thresholdBackgroundPlugin from "./chart/thresholdBackgroundPlugin";


ChartJS.register(thresholdBackgroundPlugin());


const SENSOR_COLORS = [
  "rgb(75, 192, 192)",
  "rgb(255, 99, 132)",
  "rgb(54, 162, 235)",
  "rgb(255, 206, 86)",
  "rgb(153, 102, 255)",
];

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

// Default ranges
const TEMP_RANGE = { min: -5, max: 20 };
const HUM_RANGE = { min: 10, max: 100 };

const EXCLUDED_FIELDS = ["lvHeatPower"];


export default function SensorChart({ timestamps, sensorData }) {
  const sensors = Object.keys(sensorData);

  // --- Compute actual data ranges ---
  let tempValues = [];
  let humValues = [];

  sensors.forEach((sensor) => {
    const values = sensorData[sensor] || [];
    if (sensor.toLowerCase().includes("temp")) {
      tempValues.push(...values);
    } else {
      humValues.push(...values);
    }
  });

  const tempMin = Math.min(TEMP_RANGE.min, ...tempValues);
  const tempMax = Math.max(TEMP_RANGE.max, ...tempValues);

  const humMin = Math.min(HUM_RANGE.min, ...humValues);
  const humMax = Math.max(HUM_RANGE.max, ...humValues);

  // --- Scales ---
  const scales = {
    x: {
      title: { display: true, text: "Time" },
    },
    "y-temperature": {
      type: "linear",
      position: "left",
      min: tempMin,
      max: tempMax,
      title: {
        display: true,
        text: "Temperature (°C)",
      },
    },
    "y-humidity": {
      type: "linear",
      position: "right",
      min: humMin,
      max: humMax,
      title: {
        display: true,
        text: "Humidity (%)",
      },
      grid: {
        drawOnChartArea: false,
      },
    },
  };

  const chartData = {
    labels: timestamps,
    datasets: sensors
      .filter((sensor) => !EXCLUDED_FIELDS.includes(sensor))
      .map((sensor, idx) => ({
        label: sensor,
        data: sensorData[sensor],
        borderColor: SENSOR_COLORS[idx % SENSOR_COLORS.length],
        tension: 0.3,
        yAxisID: sensor.toLowerCase().includes("temp")
          ? "y-temperature"
          : "y-humidity",
      })),
  };

  const options = {
    responsive: true,
    animation: false,
    scales,
    plugins: {
      thresholdBackground: {
        values: sensorData.lvHeatPower,
        threshold: 1,
        colorAbove: "rgba(255, 99, 132, 0.5)",
        colorBelow: null
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
