export async function fetchSensors() {

  //return getMockSensorReport(); // For testing only

  const res = await fetch("/report");
  if (!res.ok) {
    throw new Error("Failed to fetch sensors");
  }

  const data = await res.json();

  return {
    ...data,
    timestamp: new Date()
  };
}

// For testing only
const MOCK_DATA_INTERVAL_MS = 15 * 60 * 1000;
const mockState = {
  reportDate: new Date()
};

function getMockSensorReport() {

  const mockReportDate = mockState.reportDate;
  mockState.reportDate = new Date(mockReportDate.getTime() + MOCK_DATA_INTERVAL_MS);

  const temperature = Math.sin((mockReportDate.getHours()-6) * Math.PI / 12)*7 + 2 + Math.random() * 2;
  const activationTemp = 1.5;
  const lvHeatPower = temperature < activationTemp ? (Math.random() * 90 + 10) : 0;

  return {
    timestamp: mockReportDate,
    temperature,
    humidity: 66.8 + Math.random() * 10,
    activationTemp,
    deactivationTemp: 2.5,
    lvHeatPower,
    hvHeatPower: lvHeatPower > 0 ? 100 : 0,
    lastHeatOn: 123,
    lastReconnect: 333,
    uptimeMillis: 55665
  };
}