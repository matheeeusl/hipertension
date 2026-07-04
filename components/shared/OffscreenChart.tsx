"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { BloodPressureChartData } from "@/interfaces/BloodPressure";
import { WeightChartData } from "@/interfaces/Weight";
import { TemperatureChartData } from "@/interfaces/Temperature";
import { celsiusToFahrenheit } from "@/utils/measurementsChart";

type OffscreenChartProps =
  | { type: "bp"; chartData: BloodPressureChartData[] }
  | { type: "weight"; chartData: WeightChartData[] }
  | { type: "temperature"; chartData: TemperatureChartData[]; unit?: "C" | "F" };

const chartColors = {
  systolic: "rgb(54, 162, 235)",
  diastolic: "rgb(255, 99, 132)",
  weight: "rgb(34, 197, 94)",
  temperature: "rgb(249, 115, 22)",
};

export const OffscreenChart = (props: OffscreenChartProps) => {
  if (props.type === "bp") {
    return (
      <div style={{ width: 800, height: 300, background: "#fff" }}>
        <LineChart width={800} height={300} data={props.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
          <YAxis domain={["dataMin - 10", "dataMax + 10"]} tick={{ fontSize: 12 }} label={{ value: "mmHg", angle: -90, position: "insideLeft" }} />
          <Line dataKey="systolic" type="monotone" stroke={chartColors.systolic} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
          <Line dataKey="diastolic" type="monotone" stroke={chartColors.diastolic} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
        </LineChart>
      </div>
    );
  }

  if (props.type === "weight") {
    return (
      <div style={{ width: 800, height: 300, background: "#fff" }}>
        <LineChart width={800} height={300} data={props.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
          <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 12 }} label={{ value: "kg", angle: -90, position: "insideLeft" }} />
          <Line dataKey="weight" type="monotone" stroke={chartColors.weight} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
        </LineChart>
      </div>
    );
  }

  const unit = props.unit ?? "C";
  const displayData = props.chartData.map((d) => ({
    ...d,
    temperature: unit === "F" ? celsiusToFahrenheit(d.temperature) : d.temperature,
  }));
  const unitLabel = unit === "F" ? "°F" : "°C";
  const domain: [string, string] = unit === "F"
    ? ["dataMin - 1", "dataMax + 1"]
    : ["dataMin - 0.5", "dataMax + 0.5"];

  return (
    <div style={{ width: 800, height: 300, background: "#fff" }}>
      <LineChart width={800} height={300} data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
        <YAxis domain={domain} tick={{ fontSize: 12 }} label={{ value: unitLabel, angle: -90, position: "insideLeft" }} />
        <Line dataKey="temperature" type="monotone" stroke={chartColors.temperature} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
      </LineChart>
    </div>
  );
};
