"use client";

import { useState, useMemo } from "react";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BloodPressure } from "@/interfaces/BloodPressure";
import { useBloodPressure } from "@/hooks/useBloodPressure";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";
import { getBPCategory } from "@/utils/bpCategory";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { BPCitationFooter } from "@/components/shared/BPCitationFooter";
import { ReadingTableRow } from "@/components/shared/ReadingTableRow";
import { FilterButtonGroup } from "@/components/shared/FilterButtonGroup";

const PAGE_SIZE = 10;

type SortColumn = "systolic" | "diastolic" | "category" | "date";
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
  const Icon = isActive
    ? sortDirection === "asc" ? ChevronUp : ChevronDown
    : ChevronsUpDown;

  return (
    <TableHead
      className="cursor-pointer select-none whitespace-nowrap"
      onClick={() => onSort(column)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <Icon size={14} className={isActive ? "text-foreground" : "text-muted-foreground"} />
      </span>
    </TableHead>
  );
};

export const History = ({ userId }: { userId: string }) => {
  const { data, error, isLoading, deleteReading } = useBloodPressure(userId);
  const { t } = useLocale();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
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
        let aVal: string | number;
        let bVal: string | number;

        if (sortColumn === "systolic") {
          aVal = a.systolic_pressure;
          bVal = b.systolic_pressure;
        } else if (sortColumn === "diastolic") {
          aVal = a.diastolic_pressure;
          bVal = b.diastolic_pressure;
        } else if (sortColumn === "date") {
          aVal = new Date(a.recorded_at).getTime();
          bVal = new Date(b.recorded_at).getTime();
        } else {
          aVal = getBPCategory(a.systolic_pressure, a.diastolic_pressure, t.history.categories).text;
          bVal = getBPCategory(b.systolic_pressure, b.diastolic_pressure, t.history.categories).text;
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, period, sortColumn, sortDirection, t.history.categories]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(processedData.length / PAGE_SIZE)), [processedData.length]);
  const paginatedData = useMemo(
    () => processedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [processedData, page]
  );

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteReading(pendingDeleteId);
      toast.success(t.history.deleteSuccess);
    } catch (error) {
      console.error("Error deleting reading:", error);
      toast.error(t.history.deleteError);
    } finally {
      setPendingDeleteId(null);
    }
  };

  if (isLoading) return <LoadingSpinner text={t.history.loading} />;
  if (error) return <ErrorAlert message={t.history.loadError} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="text-lg font-semibold">{t.history.title}</h3>
        <div className="flex flex-wrap items-center gap-3">
          <FilterButtonGroup
            options={filterOptions}
            selected={period}
            onSelect={handlePeriodChange}
          />
          <span className="text-sm text-gray-500">
            {processedData.length}{" "}
            {processedData.length !== 1 ? t.history.readings : t.history.reading}
          </span>
        </div>
      </div>

      {processedData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {data.length === 0 ? t.history.noReadings : t.history.noReadingsForPeriod}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead column="systolic" label={t.history.columns.systolic} sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <SortableHead column="diastolic" label={t.history.columns.diastolic} sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <SortableHead column="category" label={`${t.history.columns.category} *`} sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <SortableHead column="date" label={t.history.columns.dateTime} sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
              <TableHead>{t.history.columns.notes}</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((reading: BloodPressure) => (
              <ReadingTableRow
                key={reading.id}
                reading={reading}
                categories={t.history.categories}
                dateFormat="MMM dd, yyyy HH:mm"
                onDelete={setPendingDeleteId}
              />
            ))}
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

      {data.length > 0 && <BPCitationFooter />}

      <AlertDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => { if (!open) setPendingDeleteId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.history.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.history.deleteConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.history.deleteCancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {t.history.deleteButton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
