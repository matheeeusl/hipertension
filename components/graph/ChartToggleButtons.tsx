"use client";

import { useLocale } from "@/contexts/LocaleContext";

interface Props {
  hasBpData: boolean;
  hasWeight: boolean;
  hasTemperature: boolean;
  showBp: boolean;
  showWeight: boolean;
  showTemperature: boolean;
  onToggleBp: () => void;
  onToggleWeight: () => void;
  onToggleTemperature: () => void;
}

export const ChartToggleButtons = ({
  hasBpData,
  hasWeight,
  hasTemperature,
  showBp,
  showWeight,
  showTemperature,
  onToggleBp,
  onToggleWeight,
  onToggleTemperature,
}: Props) => {
  const { t } = useLocale();

  return (
    <div className="flex justify-end gap-2 mt-2">
      {hasBpData && (
        <button
          onClick={onToggleBp}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            showBp
              ? "bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400"
              : "bg-muted border-border text-muted-foreground"
          }`}
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: showBp ? "rgb(54, 162, 235)" : "currentColor" }}
          />
          {showBp ? t.graph.hideBp : t.graph.showBp}
        </button>
      )}
      {hasWeight && (
        <button
          onClick={onToggleWeight}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            showWeight
              ? "bg-green-100 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400"
              : "bg-muted border-border text-muted-foreground"
          }`}
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: showWeight ? "rgb(34, 197, 94)" : "currentColor" }}
          />
          {showWeight ? t.graph.hideWeight : t.graph.showWeight}
        </button>
      )}
      {hasTemperature && (
        <button
          onClick={onToggleTemperature}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            showTemperature
              ? "bg-orange-100 border-orange-400 text-orange-700 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-400"
              : "bg-muted border-border text-muted-foreground"
          }`}
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: showTemperature ? "rgb(249, 115, 22)" : "currentColor" }}
          />
          {showTemperature ? t.graph.hideTemperature : t.graph.showTemperature}
        </button>
      )}
    </div>
  );
};
