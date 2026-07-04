"use client";

import { useState, useMemo, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Temperature } from "@/interfaces/Temperature";
import { useTemperature } from "@/hooks/useTemperature";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { FilterButtonGroup } from "@/components/shared/FilterButtonGroup";
import { SortableHead } from "@/components/shared/SortableHead";
import { HistoryPagination } from "@/components/shared/HistoryPagination";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ExportMenu } from "@/components/shared/ExportMenu";
import { OffscreenChart } from "@/components/shared/OffscreenChart";
import { TemperatureTableRow } from "./TemperatureTableRow";
import { FilterPeriod, getPeriodCutoff } from "@/utils/periodFilter";
import {
  exportTemperatureToCSV,
  exportTemperatureToPDF,
  captureChartImage,
} from "@/utils/exportUtils";
import { transformTemperatureData } from "@/utils/measurementsChart";

type TempUnit = "C" | "F";

const PAGE_SIZE = 5;

type SortColumn = "temperature" | "date";
type SortDirection = "asc" | "desc";

export const TemperatureHistory = ({ userId }: { userId: string }) => {
  const { data, error, isLoading, deleteReading } = useTemperature(userId);
  const { t, locale } = useLocale();
  const [unit, setUnit] = useState<TempUnit>(locale === "en" ? "F" : "C");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [period, setPeriod] = useState<FilterPeriod>("all");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => { setUnit(locale === "en" ? "F" : "C"); }, [locale]);

  const filterOptions = useMemo(
    () => (Object.entries(t.graph.filters) as [FilterPeriod, string][]).map(([value, label]) => ({ value, label })),
    [t.graph.filters],
  );

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortColumn(col); setSortDirection("asc"); }
    setPage(1);
  };

  const processedData = useMemo(() => {
    const cutoff = getPeriodCutoff(period);
    const result = cutoff ? data.filter((r) => new Date(r.recorded_at) >= cutoff) : [...data];
    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = sortColumn === "temperature" ? a.temperature : new Date(a.recorded_at).getTime();
        const bVal = sortColumn === "temperature" ? b.temperature : new Date(b.recorded_at).getTime();
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, period, sortColumn, sortDirection]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(processedData.length / PAGE_SIZE)), [processedData.length]);
  const paginatedData = useMemo(() => processedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [processedData, page]);

  const unitLabel = unit === "C" ? t.temperature.unitCelsius : t.temperature.unitFahrenheit;

  const handleExportCSV = () => {
    exportTemperatureToCSV(processedData, period, t);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const chartData = transformTemperatureData(processedData);
      const container = document.createElement("div");
      container.style.cssText = "position:absolute;left:-9999px;top:-9999px;";
      document.body.appendChild(container);
      const root = createRoot(container);
      root.render(<OffscreenChart type="temperature" chartData={chartData} unit={unit} />);
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const imageDataUrl = await captureChartImage(container);
      root.unmount();
      document.body.removeChild(container);
      await exportTemperatureToPDF(processedData, period, imageDataUrl, unit, t);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteReading(pendingDeleteId);
      toast.success(t.temperature.deleteSuccess);
    } catch {
      toast.error(t.temperature.deleteError);
    } finally {
      setPendingDeleteId(null);
    }
  };

  if (isLoading) return <LoadingSpinner text={t.temperature.loading} />;
  if (error) return <ErrorAlert message={t.temperature.loadError} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="text-lg font-semibold">{t.temperature.historyTitle}</h3>
        <div className="flex flex-wrap items-center gap-3">
          <FilterButtonGroup options={filterOptions} selected={period} onSelect={(p) => { setPeriod(p); setPage(1); }} />
          <ExportMenu
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
            isExporting={isExporting}
            disabled={processedData.length === 0}
            labels={t.export}
          />
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setUnit("C")}
              className={`px-2 py-1 text-xs font-medium transition-colors ${
                unit === "C"
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setUnit("F")}
              className={`px-2 py-1 text-xs font-medium transition-colors ${
                unit === "F"
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              °F
            </button>
          </div>
          <span className="text-sm text-gray-500">
            {processedData.length}{" "}
            {processedData.length !== 1 ? t.temperature.readings : t.temperature.reading}
          </span>
        </div>
      </div>

      {processedData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {data.length === 0 ? t.temperature.noReadings : t.temperature.noReadingsForPeriod}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead
                column="temperature"
                label={`${t.temperature.columns.temperature} (${unitLabel})`}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <TableHead>{t.temperature.columns.category}</TableHead>
              <SortableHead column="date" label={t.temperature.columns.dateTime} sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <TableHead>{t.temperature.columns.notes}</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((reading: Temperature) => (
              <TemperatureTableRow
                key={reading.id}
                reading={reading}
                unit={unit}
                categories={t.temperature.categories}
                onDelete={setPendingDeleteId}
                userId={userId}
              />
            ))}
          </TableBody>
        </Table>
      )}

      <HistoryPagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
      />

      <DeleteConfirmDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => { if (!open) setPendingDeleteId(null); }}
        onConfirm={handleDeleteConfirm}
        title={t.temperature.deleteConfirm}
        description={t.temperature.deleteConfirmDescription}
        cancelLabel={t.temperature.deleteCancel}
        confirmLabel={t.temperature.deleteButton}
      />
    </div>
  );
};
