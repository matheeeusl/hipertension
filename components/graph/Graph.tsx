"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { useBloodPressure } from "@/hooks/useBloodPressure";
import { useWeight } from "@/hooks/useWeight";
import { useTemperature } from "@/hooks/useTemperature";
import { transformBloodPressureData } from "@/utils/chart";
import { transformWeightData, transformTemperatureData } from "@/utils/measurementsChart";
import { BloodPressure, BloodPressureChartData } from "@/interfaces/BloodPressure";
import { useLocale } from "@/contexts/LocaleContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { FilterButtonGroup } from "@/components/shared/FilterButtonGroup";
import { MultiSeriesLineChart, MergedChartData } from "./MultiSeriesLineChart";
import { ChartToggleButtons } from "./ChartToggleButtons";

type FilterPeriod = "3days" | "1week" | "1month" | "3months" | "all";

const filterDataByPeriod = (data: MergedChartData[], period: FilterPeriod) => {
  if (period === "all" || data.length === 0) return data;

  const cutoffDate = new Date();
  cutoffDate.setHours(0, 0, 0, 0);

  switch (period) {
    case "3days": cutoffDate.setDate(cutoffDate.getDate() - 2); break;
    case "1week": cutoffDate.setDate(cutoffDate.getDate() - 7); break;
    case "1month": cutoffDate.setMonth(cutoffDate.getMonth() - 1); break;
    case "3months": cutoffDate.setMonth(cutoffDate.getMonth() - 3); break;
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
    map.set(bp.datetime, { date: bp.date, datetime: bp.datetime, systolic: bp.systolic, diastolic: bp.diastolic });
  }
  for (const w of weightPoints) {
    const existing = map.get(w.datetime);
    if (existing) existing.weight = w.weight;
    else map.set(w.datetime, { date: w.date, datetime: w.datetime, weight: w.weight });
  }
  for (const temp of tempPoints) {
    const existing = map.get(temp.datetime);
    if (existing) existing.temperature = temp.temperature;
    else map.set(temp.datetime, { date: temp.date, datetime: temp.datetime, temperature: temp.temperature });
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
  const { t, locale } = useLocale();
  const { data: fetchedBpData, error: bpError, isLoading: bpLoading } = useBloodPressure(userId ?? "");
  const { data: weightData, isLoading: weightLoading } = useWeight(userId ?? "");
  const { data: temperatureData, isLoading: temperatureLoading } = useTemperature(userId ?? "");

  const bpData = propReadings ?? fetchedBpData;
  const isAuthenticated = !!userId && !propReadings;
  const hasBpData = bpData.length > 0;
  const hasWeight = isAuthenticated && weightData.length > 0;
  const hasTemperature = isAuthenticated && temperatureData.length > 0;

  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>("1week");
  const [showBp, setShowBp] = useState(true);
  const [showWeight, setShowWeight] = useState(true);
  const [showTemperature, setShowTemperature] = useState(true);

  const activeBp = hasBpData && showBp;
  const activeWeight = hasWeight && showWeight;
  const activeTemp = hasTemperature && showTemperature;

  const filterOptions = useMemo(
    () => (Object.entries(t.graph.filters) as [FilterPeriod, string][]).map(([value, label]) => ({ value, label })),
    [t.graph.filters],
  );

  const chartData = useMemo(() => {
    const bpPoints = transformBloodPressureData(bpData, locale);
    const wPoints = isAuthenticated ? transformWeightData(weightData, locale) : [];
    const tPoints = isAuthenticated ? transformTemperatureData(temperatureData, locale) : [];
    return filterDataByPeriod(mergeChartData(bpPoints, wPoints, tPoints), selectedPeriod);
  }, [bpData, weightData, temperatureData, isAuthenticated, selectedPeriod, locale]);

  const xAxisInterval = useMemo(() => {
    if (chartData.length <= 7) return 0;
    if (chartData.length <= 14) return 1;
    if (chartData.length <= 30) return Math.floor(chartData.length / 7);
    return Math.floor(chartData.length / 10);
  }, [chartData.length]);

  const showBpChart = activeBp && chartData.some((d) => d.systolic !== undefined);
  const showWeightChart = activeWeight && chartData.some((d) => d.weight !== undefined);
  const showTempChart = activeTemp && chartData.some((d) => d.temperature !== undefined);

  const tempOrientation: "left" | "right" = showBpChart ? "right" : "left";
  const weightOrientation: "left" | "right" = showBpChart || showTempChart ? "right" : "left";
  const weightOnRight = showWeightChart && weightOrientation === "right";
  const tempOnRight = showTempChart && tempOrientation === "right";
  const numRightAxes = (weightOnRight ? 1 : 0) + (tempOnRight ? 1 : 0);
  const rightMargin = numRightAxes >= 2 ? 80 : numRightAxes === 1 ? 50 : 20;

  const hasVisibleSeries = activeBp || activeWeight || activeTemp;
  const hasAnyData = hasBpData || hasWeight || hasTemperature;

  const isLoading =
    !propReadings && (bpLoading || (isAuthenticated && (weightLoading || temperatureLoading)));

  if (isLoading) return <LoadingSpinner text={t.graph.loadingText} size="sm" />;
  if (!propReadings && bpError) return <ErrorAlert message={t.graph.loadError} />;
  if (!hasAnyData) return <p className="text-sm text-gray-500">{t.graph.noMeasurements}</p>;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t.graph.title}</h3>
          <FilterButtonGroup options={filterOptions} selected={selectedPeriod} onSelect={setSelectedPeriod} />
        </div>
        {hasVisibleSeries && chartData.length > 0 && (
          <p className="text-sm text-gray-600">
            {t.graph.showing} {chartData.length}{" "}
            {chartData.length !== 1 ? t.graph.measurements : t.graph.measurement}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {hasVisibleSeries && chartData.length === 0 && (
          <p className="text-center text-gray-500 py-8">{t.graph.noData}</p>
        )}
        {hasVisibleSeries && chartData.length > 0 && (
          <MultiSeriesLineChart
            chartData={chartData}
            xAxisInterval={xAxisInterval}
            showBpChart={showBpChart}
            showWeightChart={showWeightChart}
            showTempChart={showTempChart}
            weightOrientation={weightOrientation}
            tempOrientation={tempOrientation}
            weightOnRight={weightOnRight}
            tempOnRight={tempOnRight}
            rightMargin={rightMargin}
          />
        )}
        <ChartToggleButtons
          hasBpData={hasBpData}
          hasWeight={hasWeight}
          hasTemperature={hasTemperature}
          showBp={showBp}
          showWeight={showWeight}
          showTemperature={showTemperature}
          onToggleBp={() => setShowBp((v) => !v)}
          onToggleWeight={() => setShowWeight((v) => !v)}
          onToggleTemperature={() => setShowTemperature((v) => !v)}
        />
      </CardContent>
    </Card>
  );
};
