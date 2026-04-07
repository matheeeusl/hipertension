"use client";

import { useState, useMemo } from "react";

const PAGE_SIZE = 10;
import {
  Table,
  TableBody,
  TableCell,
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
import { Trash2 } from "lucide-react";
import { BloodPressure } from "@/interfaces/BloodPressure";
import { useBloodPressure } from "@/hooks/useBloodPressure";
import { format } from "date-fns";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";
import { getBPCategory } from "@/utils/bpCategory";

export const History = ({ userId }: { userId: string }) => {
  const { data, error, isLoading, deleteReading } = useBloodPressure(userId);
  const { t } = useLocale();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(data.length / PAGE_SIZE)), [data.length]);
  const paginatedData = useMemo(
    () => data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [data, page]
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">{t.history.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">{t.history.loadError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t.history.title}</h3>
        <span className="text-sm text-gray-500">
          {data.length}{" "}
          {data.length !== 1 ? t.history.readings : t.history.reading}
        </span>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t.history.noReadings}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.history.columns.systolic}</TableHead>
              <TableHead>{t.history.columns.diastolic}</TableHead>
              <TableHead>{t.history.columns.category} *</TableHead>
              <TableHead>{t.history.columns.dateTime}</TableHead>
              <TableHead>{t.history.columns.notes}</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((reading: BloodPressure) => {
              const category = getBPCategory(
                reading.systolic_pressure,
                reading.diastolic_pressure,
                t.history.categories,
              );
              return (
                <TableRow key={reading.id}>
                  <TableCell className="font-medium">
                    {reading.systolic_pressure}
                  </TableCell>
                  <TableCell className="font-medium">
                    {reading.diastolic_pressure}
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm ${category.color}`}>
                      {category.text}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(
                      new Date(reading.recorded_at),
                      "MMM dd, yyyy HH:mm",
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">
                    {reading.notes || "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDeleteId(reading.id)}
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

      {data.length > 0 && (
        <p className="text-xs text-gray-400 mt-2">
          * Whelton PK, et al. 2017 ACC/AHA Guideline for the Prevention,
          Detection, Evaluation, and Management of High Blood Pressure in
          Adults. <em>J Am Coll Cardiol.</em> 2018;71(19):e127–e248.{" "}
          <a
            href="https://doi.org/10.1016/j.jacc.2017.11.006"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            doi:10.1016/j.jacc.2017.11.006
          </a>
        </p>
      )}

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
