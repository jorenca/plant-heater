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


export default function SensorChart({ timestamps, sensorData }) {
  const sensors = Object.keys(sensorData);

  const scales = {
    x: {
      title: { display: true, text: "Time" },
    },
    "y-temperature": {
      type: "linear",
      position: "left",
      title: {
        display: true,
        text: "Temperature (°C)",
      },
    },
    "y-humidity": {
      type: "linear",
      position: "right",
      title: {
        display: true,
        text: "Humidity (%)",
      },
      grid: {
        drawOnChartArea: false,
      }
    }
  };

  const chartData = {
    labels: timestamps,
    datasets: sensors.map((sensor, idx) => ({
      label: sensor, // 🔒 unchanged
      data: sensorData[sensor],
      borderColor: SENSOR_COLORS[idx % SENSOR_COLORS.length],
      tension: 0.3,
      yAxisID: sensor.toLowerCase().includes('temp') ? 'y-temperature' : 'y-humidity',
    })),
  };

  const options = {
    responsive: true,
    animation: false,
    scales,
  };

  return <Line data={chartData} options={options} />;
}
