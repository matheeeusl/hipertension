import { Temperature, TemperatureChartData } from "@/interfaces/Temperature";
import { Weight, WeightChartData } from "@/interfaces/Weight";
import { formatChartDate } from "./formatDate";

export const celsiusToFahrenheit = (c: number): number =>
  Math.round((c * 9 / 5 + 32) * 10) / 10;

export const fahrenheitToCelsius = (f: number): number =>
  Math.round(((f - 32) * 5 / 9) * 100) / 100;

const transformReadings = <T extends { recorded_at: string }, R>(
  data: T[],
  extract: (item: T) => R,
  locale?: string
): Array<{ date: string; datetime: string } & R> =>
  [...data]
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map((r) => ({ date: formatChartDate(r.recorded_at, locale), datetime: r.recorded_at, ...extract(r) }));

export const transformTemperatureData = (data: Temperature[], locale?: string): TemperatureChartData[] =>
  transformReadings(data, (r) => ({ temperature: r.temperature }), locale);

export const transformWeightData = (data: Weight[], locale?: string): WeightChartData[] =>
  transformReadings(data, (r) => ({ weight: r.weight }), locale);
