export async function fetchSensors() {
//  return {
//    temperature: 15 + Math.random() * 10,
//    humidity: 66.8 + Math.random() * 10,
//    activationTemp: 1.5,
//    deactivationTemp: 2.5,
//    lvHeatPower: Math.random() * 100,
//    hvHeatPower: Math.random() > 0.5 ? 0 : 100,
//    lastHeatOn: 123,
//    lastReconnect: 333,
//    uptimeMillis: 55665
//  }; // For testing only

  const res = await fetch("/report");
  if (!res.ok) {
    throw new Error("Failed to fetch sensors");
  }
  return res.json();
}
