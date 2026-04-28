"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { BloodPressure } from "@/interfaces/BloodPressure";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useLocale } from "@/contexts/LocaleContext";
import { getBPCategory } from "@/utils/bpCategory";
import { formatDate } from "@/utils/formatDate";
import { ReadingDialog } from "./ReadingDialog";

interface Props {
  reading: BloodPressure;
  categories: Parameters<typeof getBPCategory>[2];
  dateFormat: string;
  onDelete: (id: string) => void;
  userId?: string;
}

export const ReadingTableRow = ({ reading, categories, dateFormat, onDelete, userId }: Props) => {
  const [open, setOpen] = useState(false);
  const { locale } = useLocale();

  const category = getBPCategory(reading.systolic_pressure, reading.diastolic_pressure, categories);

  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => setOpen(true)}>
        <TableCell className="font-medium">{reading.systolic_pressure}</TableCell>
        <TableCell className="font-medium">{reading.diastolic_pressure}</TableCell>
        <TableCell>
          <span className={`text-sm ${category.color}`}>{category.text}</span>
        </TableCell>
        <TableCell className="text-sm">
          {formatDate(reading.recorded_at, dateFormat, locale)}
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

      <ReadingDialog
        reading={reading}
        categories={categories}
        open={open}
        onOpenChange={setOpen}
        userId={userId}
      />
    </>
  );
};
