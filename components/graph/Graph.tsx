"use client";

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Card, CardContent, CardHeader } from "../ui/card";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useBloodPressure } from "@/hooks/useBloodPressure";
import { transformBloodPressureData } from "@/utils/chart";
import { useState, useMemo } from "react";
import { BloodPressureChartData } from "@/interfaces/BloodPressure";

const userId = process.env.NEXT_PUBLIC_USER_ID || '';

type FilterPeriod = '3days' | '1week' | '1month' | '3months' | 'all';

const filterOptions: { value: FilterPeriod; label: string }[] = [
  { value: '3days', label: 'Last 3 Days' },
  { value: '1week', label: 'Last Week' },
  { value: '1month', label: 'Last Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: 'all', label: 'All Data' },
];

const filterDataByPeriod = (data: BloodPressureChartData[], period: FilterPeriod) => {
  if (period === 'all' || data.length === 0) return data;

  const now = new Date();
  now.setHours(23, 59, 59, 999)
  const cutoffDate = new Date();

  switch (period) {
    case '3days':
      cutoffDate.setDate(now.getDate() - 2);
      cutoffDate.setHours(0, 0, 0, 0);
      break;
    case '1week':
      cutoffDate.setDate(now.getDate() - 7);
      cutoffDate.setHours(0, 0, 0, 0);
      break;
    case '1month':
      cutoffDate.setMonth(now.getMonth() - 1);
      cutoffDate.setHours(0, 0, 0, 0);
      break;
    case '3months':
      cutoffDate.setMonth(now.getMonth() - 3);
      cutoffDate.setHours(0, 0, 0, 0);
      break;
  }

  return data.filter(item => {
    const itemDate = new Date(item.datetime);
    return itemDate >= cutoffDate;
  });
};

export const Graph = () => {
  const { data, error, isLoading } = useBloodPressure(userId);
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>('1week');

  const chartConfig = {
    systolic: {
      label: 'Systolic',
      color: 'rgb(54, 162, 235)',
    },
    diastolic: {
      label: 'Diastolic',
      color: 'rgb(255, 99, 132)',
    },
    note: {
      label: 'Notes',
      color: 'rgb(75, 192, 192)',
    }
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    const transformedData = transformBloodPressureData(data);
    return filterDataByPeriod(transformedData, selectedPeriod);
  }, [data, selectedPeriod]);

  const getXAxisInterval = () => {
    if (chartData.length <= 7) return 0; // Show all labels for 7 or fewer points
    if (chartData.length <= 14) return 1; // Show every other label
    if (chartData.length <= 30) return Math.floor(chartData.length / 7); // Show ~7 labels
    return Math.floor(chartData.length / 10); // Show ~10 labels for larger datasets
  };

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {JSON.stringify(error)}</p>
      ) : data.length === 0 ? (
        <p>No measurements found.</p>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Blood Pressure</h3>
              <div className="flex gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedPeriod(option.value)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${selectedPeriod === option.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {chartData.length > 0 && (
              <p className="text-sm text-gray-600">
                Showing {chartData.length} measurement{chartData.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No data available for the selected period.
              </p>
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
                    interval={getXAxisInterval()}
                  />
                  <YAxis
                    domain={['dataMin - 10', 'dataMax + 10']}
                    tick={{ fontSize: 12 }}
                    label={{ value: 'mmHg', angle: -90, position: 'insideLeft' }}
                  />
                  <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent
                      indicator="line"
                      labelFormatter={(label) => `Date: ${label}`}
                      formatter={(value, name) => [
                        `${value} mmHg`,
                        chartConfig[name as keyof typeof chartConfig]?.label || name
                      ]}
                    />}
                  />
                  <Line
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
                    connectNulls={false}
                  />
                  <Line
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
                    connectNulls={false}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Alternative version with enhanced filtering and better mobile responsiveness
export const GraphWithMockData = () => {
  const { data, error, isLoading } = useBloodPressure(userId);
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>('1week');

  const chartConfig = {
    systolic: {
      label: 'Systolic Pressure',
      color: 'rgb(54, 162, 235)',
    },
    diastolic: {
      label: 'Diastolic Pressure',
      color: 'rgb(255, 99, 132)',
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    let transformedData = transformBloodPressureData(data);
    transformedData = filterDataByPeriod(transformedData, selectedPeriod);

    // Add mock data for single point visualization
    if (transformedData.length === 1) {
      const singlePoint = transformedData[0];
      transformedData = [
        { ...singlePoint, date: "Previous" },
        singlePoint,
        { ...singlePoint, date: "Next" },
      ];
    }

    return transformedData;
  }, [data, selectedPeriod]);

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {JSON.stringify(error)}</p>
      ) : data.length === 0 ? (
        <p>No measurements found.</p>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-semibold">Blood Pressure</h3>
                {data.length === 1 && (
                  <p className="text-sm text-muted-foreground">
                    Add more readings to visualize the trend
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedPeriod(option.value)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${selectedPeriod === option.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No data available for the selected period.
              </p>
            ) : (
              <ChartContainer config={chartConfig}>
                <LineChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
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
                    interval={chartData.length > 10 ? Math.floor(chartData.length / 7) : 0}
                  />
                  <YAxis
                    domain={[40, 200]}
                    tick={{ fontSize: 12 }}
                    label={{ value: 'mmHg', angle: -90, position: 'insideLeft' }}
                  />
                  <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent
                      indicator="line"
                      labelFormatter={(label) => `${label}`}
                      formatter={(value, name) => [
                        `${value} mmHg`,
                        chartConfig[name as keyof typeof chartConfig]?.label || name
                      ]}
                    />}
                  />
                  <Line
                    dataKey="systolic"
                    type="monotone"
                    stroke={chartConfig.systolic.color}
                    strokeWidth={2}
                    dot={{ fill: chartConfig.systolic.color, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    dataKey="diastolic"
                    type="monotone"
                    stroke={chartConfig.diastolic.color}
                    strokeWidth={2}
                    dot={{ fill: chartConfig.diastolic.color, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};