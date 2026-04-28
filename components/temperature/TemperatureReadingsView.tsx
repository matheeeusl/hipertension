"use client";

import { useState } from "react";
import { BarChart2, Table2 } from "lucide-react";
import { useTemperature } from "@/hooks/useTemperature";
import { TemperatureGraph } from "@/components/temperature/TemperatureGraph";
import { TemperatureHistory } from "@/components/temperature/TemperatureHistory";

export const TemperatureReadingsView = ({ userId }: { userId: string }) => {
  const [view, setView] = useState<"graph" | "table">("table");
  const { data } = useTemperature(userId);

  if (data.length === 0) return null;

  return (
    <div className="w-full space-y-3">
      <div className="flex">
        <div className="inline-flex rounded-md border bg-muted p-1 gap-1">
          <button
            onClick={() => setView("graph")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
              view === "graph"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart2 size={14} />
          </button>
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
              view === "table"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Table2 size={14} />
          </button>
        </div>
      </div>

      {view === "graph" ? (
        <TemperatureGraph userId={userId} />
      ) : (
        <TemperatureHistory userId={userId} />
      )}
    </div>
  );
};
