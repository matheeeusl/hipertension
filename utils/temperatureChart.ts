import { format } from "date-fns";
import { Temperature, TemperatureChartData } from "@/interfaces/Temperature";

export const celsiusToFahrenheit = (c: number): number =>
  Math.round((c * 9 / 5 + 32) * 10) / 10;

export const fahrenheitToCelsius = (f: number): number =>
  Math.round(((f - 32) * 5 / 9) * 100) / 100;

export const transformTemperatureData = (data: Temperature[]): TemperatureChartData[] =>
  [...data]
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map((r) => ({
      date: format(new Date(r.recorded_at), "MMM dd HH:mm"),
      datetime: r.recorded_at,
      temperature: r.temperature,
    }));
