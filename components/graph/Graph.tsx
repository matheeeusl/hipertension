"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { Card, CardContent, CardHeader } from "../ui/card";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useBloodPressure } from "@/hooks/useBloodPressure";
import { transformBloodPressureData } from "@/utils/chart";
import { useState, useMemo } from "react";
import { BloodPressure, BloodPressureChartData } from "@/interfaces/BloodPressure";
import { useLocale } from "@/contexts/LocaleContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { FilterButtonGroup } from "@/components/shared/FilterButtonGroup";

type FilterPeriod = "3days" | "1week" | "1month" | "3months" | "all";

const chartConfig = {
  systolic: {
    label: "Systolic",
    color: "rgb(54, 162, 235)",
  },
  diastolic: {
    label: "Diastolic",
    color: "rgb(255, 99, 132)",
  },
} satisfies ChartConfig;

const filterDataByPeriod = (
  data: BloodPressureChartData[],
  period: FilterPeriod,
) => {
  if (period === "all" || data.length === 0) return data;

  const cutoffDate = new Date();
  cutoffDate.setHours(0, 0, 0, 0);

  switch (period) {
    case "3days":
      cutoffDate.setDate(cutoffDate.getDate() - 2);
      break;
    case "1week":
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      break;
    case "1month":
      cutoffDate.setMonth(cutoffDate.getMonth() - 1);
      break;
    case "3months":
      cutoffDate.setMonth(cutoffDate.getMonth() - 3);
      break;
  }

  return data.filter((item) => new Date(item.datetime) >= cutoffDate);
};

interface GraphProps {
  userId?: string;
  readings?: BloodPressure[];
}

export const Graph = ({ userId, readings: propReadings }: GraphProps) => {
  const { t } = useLocale();
  const { data: fetchedData, error, isLoading } = useBloodPressure(userId ?? "");
  const data = propReadings ?? fetchedData;
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>("1week");

  const filterOptions = useMemo(
    () =>
      (Object.entries(t.graph.filters) as [FilterPeriod, string][]).map(
        ([value, label]) => ({ value, label })
      ),
    [t.graph.filters]
  );

  const chartData = useMemo(() => {
    const transformed = transformBloodPressureData(data);
    return filterDataByPeriod(transformed, selectedPeriod);
  }, [data, selectedPeriod]);

  const xAxisInterval = useMemo(() => {
    if (chartData.length <= 7) return 0;
    if (chartData.length <= 14) return 1;
    if (chartData.length <= 30) return Math.floor(chartData.length / 7);
    return Math.floor(chartData.length / 10);
  }, [chartData.length]);

  if (!propReadings && isLoading) return <LoadingSpinner text={t.graph.loadingText} size="sm" />;
  if (!propReadings && error) return <ErrorAlert message={t.graph.loadError} />;

  if (data.length === 0) {
    return <p className="text-sm text-gray-500">{t.graph.noMeasurements}</p>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t.graph.title}</h3>
          <FilterButtonGroup
            options={filterOptions}
            selected={selectedPeriod}
            onSelect={setSelectedPeriod}
          />
        </div>
        {chartData.length > 0 && (
          <p className="text-sm text-gray-600">
            {t.graph.showing} {chartData.length}{" "}
            {chartData.length !== 1 ? t.graph.measurements : t.graph.measurement}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-center text-gray-500 py-8">{t.graph.noData}</p>
        ) : (
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 30, right: 20, left: 20, bottom: 60 }}
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
              <YAxis
                domain={["dataMin - 10", "dataMax + 10"]}
                tick={{ fontSize: 12 }}
                label={{ value: "mmHg", angle: -90, position: "insideLeft" }}
              />
              <ChartTooltip
                cursor={true}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(label) => `${t.graph.dateLabel}: ${label}`}
                  />
                }
              />
              <Line
                dataKey="systolic"
                type="monotone"
                stroke={chartConfig.systolic.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.systolic.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: chartConfig.systolic.color, strokeWidth: 2 }}
                connectNulls={false}
              />
              <Line
                dataKey="diastolic"
                type="monotone"
                stroke={chartConfig.diastolic.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.diastolic.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: chartConfig.diastolic.color, strokeWidth: 2 }}
                connectNulls={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
