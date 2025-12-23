import { calculateAverageStats, isNightTime, NIGHT_HOURS } from "./averageStats";


jest.mock("chartjs-adapter-date-fns");


function t(hour: number, minute = 0, days = 0) {
  const d = new Date("2024-01-01T00:00:00");
  d.setHours(hour, minute, 0, 0);
  return new Date(d.getTime() + days*24*60*60*1000);
}

const FULL_DAY_HOURS = [
  t(0), t(1), t(2), t(3), t(4), t(5),
  t(6), t(7), t(8), t(9), t(10), t(11),
  t(12), t(13), t(14), t(15), t(16), t(17),
  t(18), t(19), t(20), t(21), t(22), t(23)
];
const FULL_DAY_CONSTANT_TEMP = [
  10, 10, 10, 10, 10, 10,
  10, 10, 10, 10, 10, 10,
  10, 10, 10, 10, 10, 10,
  10, 10, 10, 10, 10, 10
];

describe("isNightTime", () => {
  test("Properly identifies night rate times", () => {

    expect(isNightTime(t(0, 20))).toBe(true); // 00:20
    expect(isNightTime(t(1, 10))).toBe(true); // 01:10
    expect(isNightTime(t(3, 36))).toBe(true);
    expect(isNightTime(t(5, 59))).toBe(true);

    expect(isNightTime(t(6, 0))).toBe(false);
    expect(isNightTime(t(12, 0))).toBe(false);
    expect(isNightTime(t(16, 0))).toBe(false);
    expect(isNightTime(t(21, 59))).toBe(false);

    expect(isNightTime(t(22, 0))).toBe(true);
    expect(isNightTime(t(23, 59))).toBe(true);
  });
});


describe("calculateAverageStats", () => {

  test("calculates average temperature over valid segments", () => {
    const timestamps = [
      t(10), t(11), t(12)
    ];

    const sensorData = {
      temperature: [10, 20, 30],
      lvHeatPower: [1, 1, 1]
    };

    const result = calculateAverageStats(timestamps, sensorData);

    expect(result.averagingPeriod).toBe(2 * 60 * 60 * 1000);
    expect(result.averageTemperature).toBe(20);
  });

  test("splits activity correctly when power changes between samples", () => {
    const timestamps = [...FULL_DAY_HOURS, t(0, 0, 1)];

    const sensorData = {
      temperature: [...FULL_DAY_CONSTANT_TEMP, 10],
      lvHeatPower: [
        1, 0, 0, 0, 0, 0,
        0, 0, 1, 1, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0
      ]
    };

    const result = calculateAverageStats(timestamps, sensorData);

    expect(result.activeDayHours).toBeCloseTo(2);
    expect(result.activeNightHours).toBeCloseTo(0.5);
  });


  test("counts night vs day correctly", () => {
    const timestamps = [...FULL_DAY_HOURS, t(0, 0, 1)];

    const sensorData = {
      temperature: [...FULL_DAY_CONSTANT_TEMP, 10],
      lvHeatPower: [
        0, 0, 0, 0, 1, 1,
        1, 1, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0
      ]
    };

    const result = calculateAverageStats(timestamps, sensorData);

    expect(result.activeDayHours).toBeCloseTo(2);
    expect(result.activeNightHours).toBeCloseTo(2);
  });

  test("ignores segments longer than MAX_SEGMENT_DURATION_MS", () => {
    const timestamps = [ t(9), t(10), t(13), t(14) ];

    const sensorData = {
      temperature: [10, 10, 20, 40],
      lvHeatPower: [1, 1, 1, 1]
    };

    const result = calculateAverageStats(timestamps, sensorData);

    expect(result.averagingPeriod).toBe(2 * 60 * 60 * 1000);
    expect(result.averageTemperature).toBe(20);
  });

  test("computes overall active percentage correctly", () => {
    const timestamps = [ t(10), t(11), t(12) ];

    const sensorData = {
      temperature: [20, 20, 20],
      lvHeatPower: [1, 0, 1]
    };

    const result = calculateAverageStats(timestamps, sensorData);
    expect(result.activePercentage).toBeCloseTo(0.5, 2);
  });

});
