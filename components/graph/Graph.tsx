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
import { useWeight } from "@/hooks/useWeight";
import { useTemperature } from "@/hooks/useTemperature";
import { transformBloodPressureData } from "@/utils/chart";
import { transformWeightData } from "@/utils/weightChart";
import { transformTemperatureData } from "@/utils/temperatureChart";
import { useState, useMemo } from "react";
import {
  BloodPressure,
  BloodPressureChartData,
} from "@/interfaces/BloodPressure";
import { useLocale } from "@/contexts/LocaleContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { FilterButtonGroup } from "@/components/shared/FilterButtonGroup";

type FilterPeriod = "3days" | "1week" | "1month" | "3months" | "all";

type MergedChartData = {
  date: string;
  datetime: string;
  systolic?: number;
  diastolic?: number;
  weight?: number;
  temperature?: number;
};

const chartConfig = {
  systolic: {
    label: "Systolic",
    color: "rgb(54, 162, 235)",
  },
  diastolic: {
    label: "Diastolic",
    color: "rgb(255, 99, 132)",
  },
  weight: {
    label: "Weight",
    color: "rgb(34, 197, 94)",
  },
  temperature: {
    label: "Temperature",
    color: "rgb(249, 115, 22)",
  },
} satisfies ChartConfig;

const filterDataByPeriod = (data: MergedChartData[], period: FilterPeriod) => {
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

const mergeChartData = (
  bpData: BloodPressureChartData[],
  weightPoints: { date: string; datetime: string; weight: number }[],
  tempPoints: { date: string; datetime: string; temperature: number }[],
): MergedChartData[] => {
  const map = new Map<string, MergedChartData>();

  for (const bp of bpData) {
    map.set(bp.datetime, {
      date: bp.date,
      datetime: bp.datetime,
      systolic: bp.systolic,
      diastolic: bp.diastolic,
    });
  }

  for (const w of weightPoints) {
    const existing = map.get(w.datetime);
    if (existing) {
      existing.weight = w.weight;
    } else {
      map.set(w.datetime, {
        date: w.date,
        datetime: w.datetime,
        weight: w.weight,
      });
    }
  }

  for (const temp of tempPoints) {
    const existing = map.get(temp.datetime);
    if (existing) {
      existing.temperature = temp.temperature;
    } else {
      map.set(temp.datetime, {
        date: temp.date,
        datetime: temp.datetime,
        temperature: temp.temperature,
      });
    }
  }

  return [...map.values()].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
  );
};

interface GraphProps {
  userId?: string;
  readings?: BloodPressure[];
}

export const Graph = ({ userId, readings: propReadings }: GraphProps) => {
  const { t } = useLocale();
  const {
    data: fetchedBpData,
    error: bpError,
    isLoading: bpLoading,
  } = useBloodPressure(userId ?? "");
  const { data: weightData, isLoading: weightLoading } = useWeight(
    userId ?? "",
  );
  const { data: temperatureData, isLoading: temperatureLoading } =
    useTemperature(userId ?? "");

  const bpData = propReadings ?? fetchedBpData;
  const isAuthenticated = !!userId && !propReadings;
  const hasBpData = bpData.length > 0;
  const hasWeight = isAuthenticated && weightData.length > 0;
  const hasTemperature = isAuthenticated && temperatureData.length > 0;

  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>("1week");
  const [showBp, setShowBp] = useState(true);
  const [showWeight, setShowWeight] = useState(true);
  const [showTemperature, setShowTemperature] = useState(true);

  // Which series are toggled on (data may still fall outside the period filter)
  const activeBp = hasBpData && showBp;
  const activeWeight = hasWeight && showWeight;
  const activeTemp = hasTemperature && showTemperature;

  const filterOptions = useMemo(
    () =>
      (Object.entries(t.graph.filters) as [FilterPeriod, string][]).map(
        ([value, label]) => ({ value, label }),
      ),
    [t.graph.filters],
  );

  const chartData = useMemo(() => {
    const bpPoints = transformBloodPressureData(bpData);
    const wPoints = isAuthenticated ? transformWeightData(weightData) : [];
    const tPoints = isAuthenticated
      ? transformTemperatureData(temperatureData)
      : [];
    const merged = mergeChartData(bpPoints, wPoints, tPoints);
    return filterDataByPeriod(merged, selectedPeriod);
  }, [bpData, weightData, temperatureData, isAuthenticated, selectedPeriod]);

  const xAxisInterval = useMemo(() => {
    if (chartData.length <= 7) return 0;
    if (chartData.length <= 14) return 1;
    if (chartData.length <= 30) return Math.floor(chartData.length / 7);
    return Math.floor(chartData.length / 10);
  }, [chartData.length]);

  // Guard against NaN domain: only render an axis/line when the filtered
  // chartData actually contains values for that series.
  const showBpChart = activeBp && chartData.some((d) => d.systolic !== undefined);
  const showWeightChart = activeWeight && chartData.some((d) => d.weight !== undefined);
  const showTempChart = activeTemp && chartData.some((d) => d.temperature !== undefined);

  // Axis orientation rules (recharts requires at least one left-side axis):
  // BP → always left. Temp → left when no BP, right when BP present.
  // Weight → right when any left axis exists, left when alone.
  const tempOrientation: "left" | "right" = showBpChart ? "right" : "left";
  const weightOrientation: "left" | "right" =
    showBpChart || showTempChart ? "right" : "left";

  const weightOnRight = showWeightChart && weightOrientation === "right";
  const tempOnRight = showTempChart && tempOrientation === "right";
  const numRightAxes = (weightOnRight ? 1 : 0) + (tempOnRight ? 1 : 0);
  const rightMargin = numRightAxes >= 2 ? 80 : numRightAxes === 1 ? 50 : 20;

  const hasVisibleSeries = activeBp || activeWeight || activeTemp;
  const hasAnyData = hasBpData || hasWeight || hasTemperature;

  const isLoading =
    !propReadings &&
    (bpLoading || (isAuthenticated && (weightLoading || temperatureLoading)));

  if (isLoading) return <LoadingSpinner text={t.graph.loadingText} size="sm" />;
  if (!propReadings && bpError)
    return <ErrorAlert message={t.graph.loadError} />;

  if (!hasAnyData) {
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
        {hasVisibleSeries && chartData.length > 0 && (
          <p className="text-sm text-gray-600">
            {t.graph.showing} {chartData.length}{" "}
            {chartData.length !== 1
              ? t.graph.measurements
              : t.graph.measurement}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {hasVisibleSeries && chartData.length === 0 && (
          <p className="text-center text-gray-500 py-8">{t.graph.noData}</p>
        )}
        {hasVisibleSeries && chartData.length > 0 && (
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 30,
                right: rightMargin,
                left: 20,
                bottom: 60,
              }}
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
                    position:
                      weightOrientation === "right"
                        ? "insideRight"
                        : "insideLeft",
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
                    position:
                      tempOrientation === "right" ? "insideRight" : "insideLeft",
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
                  dot={{
                    fill: chartConfig.systolic.color,
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: chartConfig.systolic.color,
                    strokeWidth: 2,
                  }}
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
                  dot={{
                    fill: chartConfig.diastolic.color,
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: chartConfig.diastolic.color,
                    strokeWidth: 2,
                  }}
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
                  activeDot={{
                    r: 6,
                    stroke: chartConfig.weight.color,
                    strokeWidth: 2,
                  }}
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
                  dot={{
                    fill: chartConfig.temperature.color,
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: chartConfig.temperature.color,
                    strokeWidth: 2,
                  }}
                  connectNulls={true}
                />
              )}
            </LineChart>
          </ChartContainer>
        )}
        <div className="flex justify-end gap-2 mt-2">
          {hasBpData && (
            <button
              onClick={() => setShowBp((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                showBp
                  ? "bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400"
                  : "bg-muted border-border text-muted-foreground"
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  backgroundColor: showBp
                    ? "rgb(54, 162, 235)"
                    : "currentColor",
                }}
              />
              {showBp ? t.graph.hideBp : t.graph.showBp}
            </button>
          )}
          {hasWeight && (
            <button
              onClick={() => setShowWeight((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                showWeight
                  ? "bg-green-100 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400"
                  : "bg-muted border-border text-muted-foreground"
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  backgroundColor: showWeight
                    ? "rgb(34, 197, 94)"
                    : "currentColor",
                }}
              />
              {showWeight ? t.graph.hideWeight : t.graph.showWeight}
            </button>
          )}
          {hasTemperature && (
            <button
              onClick={() => setShowTemperature((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                showTemperature
                  ? "bg-orange-100 border-orange-400 text-orange-700 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-400"
                  : "bg-muted border-border text-muted-foreground"
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  backgroundColor: showTemperature
                    ? "rgb(249, 115, 22)"
                    : "currentColor",
                }}
              />
              {showTemperature ? t.graph.hideTemperature : t.graph.showTemperature}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
