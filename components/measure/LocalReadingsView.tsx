"use client";

import { BloodPressure } from "@/interfaces/BloodPressure";
import { Graph } from "@/components/graph/Graph";
import { LocalReadingsList } from "@/components/measure/LocalReadingsList";

interface Props {
  readings: BloodPressure[];
  onDelete: (id: string) => void;
}

const MAX_TABLE_ROWS = 5;

export const LocalReadingsView = ({ readings, onDelete }: Props) => {
  if (readings.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      <Graph readings={readings} />
      <LocalReadingsList
        readings={readings.slice(0, MAX_TABLE_ROWS)}
        onDelete={onDelete}
      />
    </div>
  );
};
