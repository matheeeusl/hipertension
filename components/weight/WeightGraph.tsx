"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useWeight } from "@/hooks/useWeight";
import { transformWeightData } from "@/utils/measurementsChart";
import { useLocale } from "@/contexts/LocaleContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { FilterButtonGroup } from "@/components/shared/FilterButtonGroup";
import { WeightChartData } from "@/interfaces/Weight";
import { FilterPeriod } from "@/utils/periodFilter";

const chartConfig = {
  weight: {
    label: "Weight",
    color: "rgb(34, 197, 94)",
  },
} satisfies ChartConfig;

const filterDataByPeriod = (data: WeightChartData[], period: FilterPeriod) => {
  if (period === "all" || data.length === 0) return data;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  if (period === "3days") cutoff.setDate(cutoff.getDate() - 2);
  if (period === "1week") cutoff.setDate(cutoff.getDate() - 7);
  if (period === "1month") cutoff.setMonth(cutoff.getMonth() - 1);
  if (period === "3months") cutoff.setMonth(cutoff.getMonth() - 3);
  return data.filter((item) => new Date(item.datetime) >= cutoff);
};

export const WeightGraph = ({ userId }: { userId: string }) => {
  const { t } = useLocale();
  const { data: rawData, error, isLoading } = useWeight(userId);
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>("1week");

  const filterOptions = useMemo(
    () =>
      (Object.entries(t.graph.filters) as [FilterPeriod, string][]).map(
        ([value, label]) => ({ value, label }),
      ),
    [t.graph.filters],
  );

  const chartData = useMemo(() => {
    const transformed = transformWeightData(rawData);
    return filterDataByPeriod(transformed, selectedPeriod);
  }, [rawData, selectedPeriod]);

  const xAxisInterval = useMemo(() => {
    if (chartData.length <= 7) return 0;
    if (chartData.length <= 14) return 1;
    if (chartData.length <= 30) return Math.floor(chartData.length / 7);
    return Math.floor(chartData.length / 10);
  }, [chartData.length]);

  if (isLoading) return <LoadingSpinner text={t.graph.loadingText} size="sm" />;
  if (error) return <ErrorAlert message={t.graph.loadError} />;
  if (rawData.length === 0)
    return <p className="text-sm text-gray-500">{t.graph.noMeasurements}</p>;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t.weight.graphTitle}</h3>
          <FilterButtonGroup
            options={filterOptions}
            selected={selectedPeriod}
            onSelect={setSelectedPeriod}
          />
        </div>
        {chartData.length > 0 && (
          <p className="text-sm text-gray-600">
            {t.graph.showing} {chartData.length}{" "}
            {chartData.length !== 1
              ? t.graph.measurements
              : t.graph.measurement}
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
                domain={["dataMin - 2", "dataMax + 2"]}
                tick={{ fontSize: 12 }}
                label={{ value: "kg", angle: -90, position: "insideLeft" }}
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
                dataKey="weight"
                type="monotone"
                stroke={chartConfig.weight.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.weight.color, strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  stroke: chartConfig.weight.color,
                  strokeWidth: 2,
                }}
                connectNulls={true}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
