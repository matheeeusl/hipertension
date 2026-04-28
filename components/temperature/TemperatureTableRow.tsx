"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Temperature } from "@/interfaces/Temperature";
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
import { getTemperatureCategory } from "@/utils/temperatureCategory";
import { celsiusToFahrenheit } from "@/utils/temperatureChart";

type TempUnit = "C" | "F";

interface Props {
  reading: Temperature;
  unit: TempUnit;
  categories: Parameters<typeof getTemperatureCategory>[1];
  onDelete: (id: string) => void;
}

export const TemperatureTableRow = ({ reading, unit, categories, onDelete }: Props) => {
  const [open, setOpen] = useState(false);
  const { t, locale } = useLocale();

  const category = getTemperatureCategory(reading.temperature, categories);
  const formatTemp = (celsius: number) =>
    unit === "F" ? `${celsiusToFahrenheit(celsius).toFixed(1)} °F` : `${celsius.toFixed(1)} °C`;

  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => setOpen(true)}>
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
            <DialogTitle>{formatTemp(reading.temperature)}</DialogTitle>
            <DialogDescription asChild>
              <span className="text-sm text-muted-foreground">
                {formatDate(reading.recorded_at, "MMM dd, yyyy HH:mm", locale)}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground block mb-1">{t.temperature.columns.category}</span>
              <p className={`font-medium ${category.color}`}>{category.text}</p>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">{t.temperature.columns.notes}</span>
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
