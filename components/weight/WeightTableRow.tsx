"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Weight } from "@/interfaces/Weight";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLocale } from "@/contexts/LocaleContext";
import { formatDate } from "@/utils/formatDate";

interface Props {
  reading: Weight;
  onDelete: (id: string) => void;
}

export const WeightTableRow = ({ reading, onDelete }: Props) => {
  const [open, setOpen] = useState(false);
  const { t, locale } = useLocale();

  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => setOpen(true)}>
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
            onClick={(e) => { e.stopPropagation(); onDelete(reading.id); }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reading.weight.toFixed(2)} kg</DialogTitle>
            <DialogDescription asChild>
              <span className="text-sm text-muted-foreground">
                {formatDate(reading.recorded_at, "MMM dd, yyyy HH:mm", locale)}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground block mb-1">{t.weight.columns.notes}</span>
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
