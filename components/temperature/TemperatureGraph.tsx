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
import { useTemperature } from "@/hooks/useTemperature";
import { transformTemperatureData, celsiusToFahrenheit } from "@/utils/temperatureChart";
import { useLocale } from "@/contexts/LocaleContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { FilterButtonGroup } from "@/components/shared/FilterButtonGroup";
import { TemperatureChartData } from "@/interfaces/Temperature";

type FilterPeriod = "3days" | "1week" | "1month" | "3months" | "all";
type TempUnit = "C" | "F";

const TEMP_COLOR = "rgb(249, 115, 22)";

const chartConfig = {
  temperature: {
    label: "Temperature",
    color: TEMP_COLOR,
  },
} satisfies ChartConfig;

const filterDataByPeriod = (data: TemperatureChartData[], period: FilterPeriod) => {
  if (period === "all" || data.length === 0) return data;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  if (period === "3days") cutoff.setDate(cutoff.getDate() - 2);
  if (period === "1week") cutoff.setDate(cutoff.getDate() - 7);
  if (period === "1month") cutoff.setMonth(cutoff.getMonth() - 1);
  if (period === "3months") cutoff.setMonth(cutoff.getMonth() - 3);
  return data.filter((item) => new Date(item.datetime) >= cutoff);
};

export const TemperatureGraph = ({ userId }: { userId: string }) => {
  const { t, locale } = useLocale();
  const { data: rawData, error, isLoading } = useTemperature(userId);
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>("1week");
  const [unit, setUnit] = useState<TempUnit>(locale === "en" ? "F" : "C");

  const filterOptions = useMemo(
    () =>
      (Object.entries(t.graph.filters) as [FilterPeriod, string][]).map(
        ([value, label]) => ({ value, label }),
      ),
    [t.graph.filters],
  );

  const chartData = useMemo(() => {
    const transformed = transformTemperatureData(rawData);
    const filtered = filterDataByPeriod(transformed, selectedPeriod);
    if (unit === "F") {
      return filtered.map((d) => ({ ...d, temperature: celsiusToFahrenheit(d.temperature) }));
    }
    return filtered;
  }, [rawData, selectedPeriod, unit]);

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

  const unitLabel = unit === "C" ? t.temperature.unitCelsius : t.temperature.unitFahrenheit;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t.temperature.graphTitle}</h3>
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
          <>
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
                  domain={["dataMin - 0.5", "dataMax + 0.5"]}
                  tick={{ fontSize: 12 }}
                  label={{ value: unitLabel, angle: -90, position: "insideLeft" }}
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
                  dataKey="temperature"
                  type="monotone"
                  stroke={TEMP_COLOR}
                  strokeWidth={2}
                  dot={{ fill: TEMP_COLOR, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: TEMP_COLOR, strokeWidth: 2 }}
                  connectNulls={true}
                />
              </LineChart>
            </ChartContainer>
            <div className="flex justify-end mt-2">
              <div className="flex border rounded-md overflow-hidden">
                <button
                  onClick={() => setUnit("C")}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    unit === "C"
                      ? "bg-orange-100 border-orange-400 text-orange-700 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-400"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.temperature.unitCelsius}
                </button>
                <button
                  onClick={() => setUnit("F")}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    unit === "F"
                      ? "bg-orange-100 border-orange-400 text-orange-700 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-400"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.temperature.unitFahrenheit}
                </button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
