"use client";

import { useState, useMemo } from "react";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { Trash2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Weight } from "@/interfaces/Weight";
import { useWeight } from "@/hooks/useWeight";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { FilterButtonGroup } from "@/components/shared/FilterButtonGroup";

const PAGE_SIZE = 5;

type SortColumn = "weight" | "date";
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

export const WeightHistory = ({ userId }: { userId: string }) => {
  const { data, error, isLoading, deleteReading } = useWeight(userId);
  const { t, locale } = useLocale();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [selectedReading, setSelectedReading] = useState<Weight | null>(null);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [period, setPeriod] = useState<FilterPeriod>("all");

  const filterOptions = useMemo(
    () => (Object.entries(t.graph.filters) as [FilterPeriod, string][]).map(([value, label]) => ({ value, label })),
    [t.graph.filters]
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

  const handlePeriodChange = (p: FilterPeriod) => { setPeriod(p); setPage(1); };

  const processedData = useMemo(() => {
    const cutoff = getPeriodCutoff(period);
    const result = cutoff
      ? data.filter((r) => new Date(r.recorded_at) >= cutoff)
      : [...data];

    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = sortColumn === "weight" ? a.weight : new Date(a.recorded_at).getTime();
        const bVal = sortColumn === "weight" ? b.weight : new Date(b.recorded_at).getTime();
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, period, sortColumn, sortDirection]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(processedData.length / PAGE_SIZE)), [processedData.length]);
  const paginatedData = useMemo(
    () => processedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [processedData, page]
  );

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteReading(pendingDeleteId);
      toast.success(t.weight.deleteSuccess);
    } catch {
      toast.error(t.weight.deleteError);
    } finally {
      setPendingDeleteId(null);
    }
  };

  if (isLoading) return <LoadingSpinner text={t.weight.loading} />;
  if (error) return <ErrorAlert message={t.weight.loadError} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="text-lg font-semibold">{t.weight.historyTitle}</h3>
        <div className="flex flex-wrap items-center gap-3">
          <FilterButtonGroup options={filterOptions} selected={period} onSelect={handlePeriodChange} />
          <span className="text-sm text-gray-500">
            {processedData.length}{" "}
            {processedData.length !== 1 ? t.weight.readings : t.weight.reading}
          </span>
        </div>
      </div>

      {processedData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {data.length === 0 ? t.weight.noReadings : t.weight.noReadingsForPeriod}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead column="weight" label={t.weight.columns.weight} sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <SortableHead column="date" label={t.weight.columns.dateTime} sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <TableHead>{t.weight.columns.notes}</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((reading: Weight) => (
              <TableRow key={reading.id} className="cursor-pointer" onClick={() => setSelectedReading(reading)}>
                <TableCell className="font-medium">{reading.weight.toFixed(2)} kg</TableCell>
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
                    onClick={(e) => { e.stopPropagation(); setPendingDeleteId(reading.id); }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
            {t.history.previous}
          </Button>
          <span className="text-sm text-gray-500">
            {t.history.page} {page} {t.history.of} {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
            {t.history.next}
          </Button>
        </div>
      )}

      {/* Detail modal */}
      <Dialog open={!!selectedReading} onOpenChange={(open) => { if (!open) setSelectedReading(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedReading?.weight.toFixed(2)} kg</DialogTitle>
            <DialogDescription asChild>
              <span className="text-sm text-muted-foreground">
                {selectedReading && formatDate(selectedReading.recorded_at, "MMM dd, yyyy HH:mm", locale)}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground block mb-1">{t.weight.columns.notes}</span>
              <p className="text-foreground whitespace-pre-wrap break-words rounded-md bg-muted p-3 min-h-[60px]">
                {selectedReading?.notes || "—"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => { if (!open) setPendingDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.weight.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>{t.weight.deleteConfirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.weight.deleteCancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              {t.weight.deleteButton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
