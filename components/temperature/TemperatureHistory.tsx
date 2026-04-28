"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronsUpDown, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Temperature } from "@/interfaces/Temperature";
import { useTemperature } from "@/hooks/useTemperature";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { FilterButtonGroup } from "@/components/shared/FilterButtonGroup";
import { getTemperatureCategory } from "@/utils/temperatureCategory";
import { celsiusToFahrenheit } from "@/utils/temperatureChart";

type TempUnit = "C" | "F";

const PAGE_SIZE = 5;

type SortColumn = "temperature" | "date";
type SortDirection = "asc" | "desc";
type FilterPeriod = "3days" | "1week" | "1month" | "3months" | "all";

const getPeriodCutoff = (period: FilterPeriod): Date | null => {
  if (period === "all") return null;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  if (period === "3days") cutoff.setDate(cutoff.getDate() - 2);
  if (period === "1week") cutoff.setDate(cutoff.getDate() - 7);
  if (period === "1month") cutoff.setMonth(cutoff.getMonth() - 1);
  if (period === "3months") cutoff.setMonth(cutoff.getMonth() - 3);
  return cutoff;
};

interface SortableHeadProps {
  column: SortColumn;
  label: string;
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
  onSort: (col: SortColumn) => void;
}

const SortableHead = ({ column, label, sortColumn, sortDirection, onSort }: SortableHeadProps) => {
  const isActive = sortColumn === column;
  const Icon = isActive ? (sortDirection === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => onSort(column)}>
      <span className="inline-flex items-center gap-1">
        {label}
        <Icon size={14} className={isActive ? "text-foreground" : "text-muted-foreground"} />
      </span>
    </TableHead>
  );
};

export const TemperatureHistory = ({ userId }: { userId: string }) => {
  const { data, error, isLoading, deleteReading } = useTemperature(userId);
  const { t, locale } = useLocale();
  const [unit, setUnit] = useState<TempUnit>(locale === "en" ? "F" : "C");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [selectedReading, setSelectedReading] = useState<Temperature | null>(null);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [period, setPeriod] = useState<FilterPeriod>("all");

  useEffect(() => {
    setUnit(locale === "en" ? "F" : "C");
  }, [locale]);

  const filterOptions = useMemo(
    () =>
      (Object.entries(t.graph.filters) as [FilterPeriod, string][]).map(([value, label]) => ({
        value,
        label,
      })),
    [t.graph.filters],
  );

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const handlePeriodChange = (p: FilterPeriod) => {
    setPeriod(p);
    setPage(1);
  };

  const processedData = useMemo(() => {
    const cutoff = getPeriodCutoff(period);
    const result = cutoff
      ? data.filter((r) => new Date(r.recorded_at) >= cutoff)
      : [...data];

    if (sortColumn) {
      result.sort((a, b) => {
        const aVal =
          sortColumn === "temperature" ? a.temperature : new Date(a.recorded_at).getTime();
        const bVal =
          sortColumn === "temperature" ? b.temperature : new Date(b.recorded_at).getTime();
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, period, sortColumn, sortDirection]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(processedData.length / PAGE_SIZE)),
    [processedData.length],
  );
  const paginatedData = useMemo(
    () => processedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [processedData, page],
  );

  const formatTemp = (celsius: number) => {
    if (unit === "F") return `${celsiusToFahrenheit(celsius).toFixed(1)} °F`;
    return `${celsius.toFixed(1)} °C`;
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

  const unitLabel = unit === "C" ? t.temperature.unitCelsius : t.temperature.unitFahrenheit;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="text-lg font-semibold">{t.temperature.historyTitle}</h3>
        <div className="flex flex-wrap items-center gap-3">
          <FilterButtonGroup options={filterOptions} selected={period} onSelect={handlePeriodChange} />
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
              <SortableHead
                column="date"
                label={t.temperature.columns.dateTime}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <TableHead>{t.temperature.columns.notes}</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((reading: Temperature) => {
              const category = getTemperatureCategory(reading.temperature, t.temperature.categories);
              return (
                <TableRow
                  key={reading.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedReading(reading)}
                >
                  <TableCell className="font-medium">{formatTemp(reading.temperature)}</TableCell>
                  <TableCell className={`text-sm ${category.color}`}>{category.text}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(reading.recorded_at, "MMM dd, yyyy HH:mm", locale)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">
                    {reading.notes || "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDeleteId(reading.id);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            {t.history.previous}
          </Button>
          <span className="text-sm text-gray-500">
            {t.history.page} {page} {t.history.of} {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
          >
            {t.history.next}
          </Button>
        </div>
      )}

      <Dialog
        open={!!selectedReading}
        onOpenChange={(open) => {
          if (!open) setSelectedReading(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedReading && formatTemp(selectedReading.temperature)}
            </DialogTitle>
            <DialogDescription asChild>
              <span className="text-sm text-muted-foreground">
                {selectedReading &&
                  formatDate(selectedReading.recorded_at, "MMM dd, yyyy HH:mm", locale)}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {selectedReading && (
              <div>
                <span className="text-muted-foreground block mb-1">
                  {t.temperature.columns.category}
                </span>
                <p
                  className={`font-medium ${
                    getTemperatureCategory(selectedReading.temperature, t.temperature.categories)
                      .color
                  }`}
                >
                  {
                    getTemperatureCategory(selectedReading.temperature, t.temperature.categories)
                      .text
                  }
                </p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground block mb-1">
                {t.temperature.columns.notes}
              </span>
              <p className="text-foreground whitespace-pre-wrap break-words rounded-md bg-muted p-3 min-h-[60px]">
                {selectedReading?.notes || "—"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.temperature.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.temperature.deleteConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.temperature.deleteCancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {t.temperature.deleteButton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
