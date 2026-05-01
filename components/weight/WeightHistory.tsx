"use client";

import { useState, useMemo } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Weight } from "@/interfaces/Weight";
import { useWeight } from "@/hooks/useWeight";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { FilterButtonGroup } from "@/components/shared/FilterButtonGroup";
import { SortableHead } from "@/components/shared/SortableHead";
import { HistoryPagination } from "@/components/shared/HistoryPagination";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { WeightTableRow } from "./WeightTableRow";

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

export const WeightHistory = ({ userId }: { userId: string }) => {
  const { data, error, isLoading, deleteReading } = useWeight(userId);
  const { t } = useLocale();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [period, setPeriod] = useState<FilterPeriod>("all");

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
  const paginatedData = useMemo(() => processedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [processedData, page]);

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
          <FilterButtonGroup options={filterOptions} selected={period} onSelect={(p) => { setPeriod(p); setPage(1); }} />
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
              <WeightTableRow key={reading.id} reading={reading} onDelete={setPendingDeleteId} userId={userId} />
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
        title={t.weight.deleteConfirm}
        description={t.weight.deleteConfirmDescription}
        cancelLabel={t.weight.deleteCancel}
        confirmLabel={t.weight.deleteButton}
      />
    </div>
  );
};
