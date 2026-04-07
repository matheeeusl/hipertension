"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { BloodPressure } from "@/interfaces/BloodPressure";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getBPCategory } from "@/utils/bpCategory";

interface Props {
  reading: BloodPressure;
  categories: Parameters<typeof getBPCategory>[2];
  dateFormat: string;
  onDelete: (id: string) => void;
}

export const ReadingTableRow = ({
  reading,
  categories,
  dateFormat,
  onDelete,
}: Props) => {
  const [open, setOpen] = useState(false);
  const category = getBPCategory(
    reading.systolic_pressure,
    reading.diastolic_pressure,
    categories,
  );

  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => setOpen(true)}>
        <TableCell className="font-medium">
          {reading.systolic_pressure}
        </TableCell>
        <TableCell className="font-medium">
          {reading.diastolic_pressure}
        </TableCell>
        <TableCell>
          <span className={`text-sm ${category.color}`}>{category.text}</span>
        </TableCell>
        <TableCell className="text-sm">
          {format(new Date(reading.recorded_at), dateFormat)}
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
              onDelete(reading.id);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reading.systolic_pressure} / {reading.diastolic_pressure} mmHg
            </DialogTitle>
            <DialogDescription asChild>
              <span className={`text-sm font-medium ${category.color}`}>
                {category.text}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Date</span>
              <span>
                {format(new Date(reading.recorded_at), "MMM dd, yyyy HH:mm")}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Systolic</span>
              <span className="font-medium">
                {reading.systolic_pressure} mmHg
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Diastolic</span>
              <span className="font-medium">
                {reading.diastolic_pressure} mmHg
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">Notes</span>
              <p className="text-foreground whitespace-pre-wrap break-words rounded-md bg-muted p-3 min-h-[60px]">
                {reading.notes || "—"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
