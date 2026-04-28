"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { useLocale } from "@/contexts/LocaleContext";

export type MergedChartData = {
  date: string;
  datetime: string;
  systolic?: number;
  diastolic?: number;
  weight?: number;
  temperature?: number;
};

export const chartConfig = {
  systolic: { label: "Systolic", color: "rgb(54, 162, 235)" },
  diastolic: { label: "Diastolic", color: "rgb(255, 99, 132)" },
  weight: { label: "Weight", color: "rgb(34, 197, 94)" },
  temperature: { label: "Temperature", color: "rgb(249, 115, 22)" },
} satisfies ChartConfig;

interface Props {
  chartData: MergedChartData[];
  xAxisInterval: number;
  showBpChart: boolean;
  showWeightChart: boolean;
  showTempChart: boolean;
  weightOrientation: "left" | "right";
  tempOrientation: "left" | "right";
  weightOnRight: boolean;
  tempOnRight: boolean;
  rightMargin: number;
}

export const MultiSeriesLineChart = ({
  chartData,
  xAxisInterval,
  showBpChart,
  showWeightChart,
  showTempChart,
  weightOrientation,
  tempOrientation,
  weightOnRight,
  rightMargin,
}: Props) => {
  const { t } = useLocale();

  return (
    <ChartContainer config={chartConfig}>
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{ top: 30, right: rightMargin, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={true}
          axisLine={true}
          tickMargin={8}
          tick={{ fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={60}
          interval={xAxisInterval}
        />
        {showBpChart && (
          <YAxis
            yAxisId="bp"
            orientation="left"
            domain={["dataMin - 10", "dataMax + 10"]}
            tick={{ fontSize: 12 }}
            label={{ value: "mmHg", angle: -90, position: "insideLeft" }}
          />
        )}
        {showWeightChart && (
          <YAxis
            yAxisId="weight"
            orientation={weightOrientation}
            domain={["dataMin - 2", "dataMax + 2"]}
            tick={{ fontSize: 12 }}
            width={weightOnRight ? 45 : 55}
            label={{
              value: "kg",
              angle: weightOrientation === "right" ? 90 : -90,
              position: weightOrientation === "right" ? "insideRight" : "insideLeft",
            }}
          />
        )}
        {showTempChart && (
          <YAxis
            yAxisId="temperature"
            orientation={tempOrientation}
            domain={["dataMin - 0.5", "dataMax + 0.5"]}
            tick={{ fontSize: 12 }}
            label={{
              value: "°C",
              angle: -90,
              position: tempOrientation === "right" ? "insideRight" : "insideLeft",
            }}
          />
        )}
        <ChartTooltip
          cursor={true}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(label) => `${t.graph.dateLabel}: ${label}`}
            />
          }
        />
        {showBpChart && (
          <Line
            yAxisId="bp"
            dataKey="systolic"
            type="monotone"
            stroke={chartConfig.systolic.color}
            strokeWidth={2}
            dot={{ fill: chartConfig.systolic.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: chartConfig.systolic.color, strokeWidth: 2 }}
            connectNulls={true}
          />
        )}
        {showBpChart && (
          <Line
            yAxisId="bp"
            dataKey="diastolic"
            type="monotone"
            stroke={chartConfig.diastolic.color}
            strokeWidth={2}
            dot={{ fill: chartConfig.diastolic.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: chartConfig.diastolic.color, strokeWidth: 2 }}
            connectNulls={true}
          />
        )}
        {showWeightChart && (
          <Line
            yAxisId="weight"
            dataKey="weight"
            type="monotone"
            stroke={chartConfig.weight.color}
            strokeWidth={2}
            dot={{ fill: chartConfig.weight.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: chartConfig.weight.color, strokeWidth: 2 }}
            connectNulls={true}
          />
        )}
        {showTempChart && (
          <Line
            yAxisId="temperature"
            dataKey="temperature"
            type="monotone"
            stroke={chartConfig.temperature.color}
            strokeWidth={2}
            dot={{ fill: chartConfig.temperature.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: chartConfig.temperature.color, strokeWidth: 2 }}
            connectNulls={true}
          />
        )}
      </LineChart>
    </ChartContainer>
  );
};
