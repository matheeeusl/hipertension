import { format } from "date-fns";
import { Weight, WeightChartData } from "@/interfaces/Weight";

export const transformWeightData = (data: Weight[]): WeightChartData[] =>
  [...data]
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map((r) => ({
      date: format(new Date(r.recorded_at), "MMM dd HH:mm"),
      datetime: r.recorded_at,
      weight: r.weight,
    }));
