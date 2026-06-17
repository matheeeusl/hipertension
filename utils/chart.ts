import {
  BloodPressure,
  BloodPressureChartData,
} from "@/interfaces/BloodPressure";
import { formatChartDate } from "./formatDate";

export const transformBloodPressureData = (
  readings: BloodPressure[],
  locale?: string
): BloodPressureChartData[] => {
  if (!readings || readings.length === 0) return [];

  return readings
    .toSorted(
      (a, b) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )
    .map((reading) => ({
      date: formatChartDate(reading.recorded_at, locale),
      datetime: reading.recorded_at,
      systolic: reading.systolic_pressure,
      diastolic: reading.diastolic_pressure,
      note: reading.notes,
    }));
};

// Additional utility functions for blood pressure analysis
export const getAverageReadings = (
  readings: BloodPressure[],
  days: number = 7
) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentReadings = readings.filter(
    (reading) => new Date(reading.recorded_at) >= cutoffDate
  );

  if (recentReadings.length === 0) return null;

  const avgSystolic =
    recentReadings.reduce((sum, r) => sum + r.systolic_pressure, 0) /
    recentReadings.length;
  const avgDiastolic =
    recentReadings.reduce((sum, r) => sum + r.diastolic_pressure, 0) /
    recentReadings.length;

  return {
    systolic: Math.round(avgSystolic),
    diastolic: Math.round(avgDiastolic),
    count: recentReadings.length,
  };
};

export const getBPTrend = (readings: BloodPressure[], days: number = 30) => {
  if (readings.length < 2) return "insufficient-data";

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentReadings = readings
    .filter((reading) => new Date(reading.recorded_at) >= cutoffDate)
    .sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );

  if (recentReadings.length < 2) return "insufficient-data";

  const firstHalf = recentReadings.slice(
    0,
    Math.floor(recentReadings.length / 2)
  );
  const secondHalf = recentReadings.slice(
    Math.floor(recentReadings.length / 2)
  );

  const firstAvgSystolic =
    firstHalf.reduce((sum, r) => sum + r.systolic_pressure, 0) /
    firstHalf.length;
  const secondAvgSystolic =
    secondHalf.reduce((sum, r) => sum + r.systolic_pressure, 0) /
    secondHalf.length;

  const difference = secondAvgSystolic - firstAvgSystolic;

  if (Math.abs(difference) < 3) return "stable";
  return difference > 0 ? "increasing" : "decreasing";
};
