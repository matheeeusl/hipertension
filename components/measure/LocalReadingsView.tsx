"use client";

import { useState } from "react";
import { BarChart2, Table2 } from "lucide-react";
import { BloodPressure } from "@/interfaces/BloodPressure";
import { Graph } from "@/components/graph/Graph";
import { LocalReadingsList } from "@/components/measure/LocalReadingsList";
import { History } from "@/components/history/History";

interface AuthenticatedProps {
  userId: string;
  readings?: never;
  onDelete?: never;
}

interface AnonymousProps {
  userId?: never;
  readings: BloodPressure[];
  onDelete: (id: string) => void;
}

type Props = AuthenticatedProps | AnonymousProps;

export const LocalReadingsView = ({ userId, readings, onDelete }: Props) => {
  const [view, setView] = useState<"graph" | "table">("table");

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-end">
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
        userId ? (
          <Graph userId={userId} />
        ) : (
          <Graph readings={readings} />
        )
      ) : userId ? (
        <History userId={userId} />
      ) : (
        <LocalReadingsList readings={readings!} onDelete={onDelete!} />
      )}
    </div>
  );
};
