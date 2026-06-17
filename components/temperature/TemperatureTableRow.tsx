"use client";

import { useState, useMemo, useCallback } from "react";
import { Trash2, Pencil } from "lucide-react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Temperature } from "@/interfaces/Temperature";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { celsiusToFahrenheit, fahrenheitToCelsius } from "@/utils/measurementsChart";
import { useTemperature } from "@/hooks/useTemperature";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TempUnit = "C" | "F";

type EditFormData = {
  temperature: string;
  notes?: string;
};

interface Props {
  reading: Temperature;
  unit: TempUnit;
  categories: Parameters<typeof getTemperatureCategory>[1];
  onDelete: (id: string) => void;
  userId?: string;
}

export const TemperatureTableRow = ({ reading, unit, categories, onDelete, userId }: Props) => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { t, locale } = useLocale();
  const { updateReading, isUpdating } = useTemperature(userId ?? "");

  const category = getTemperatureCategory(reading.temperature, categories);
  const formatTemp = (celsius: number) =>
    unit === "F" ? `${celsiusToFahrenheit(celsius).toFixed(1)} °F` : `${celsius.toFixed(1)} °C`;

  const EditSchema = useMemo(
    () =>
      z.object({
        temperature: z
          .string()
          .regex(/^\d+([.,]\d+)?$/, t.temperature.validation.tempNumbers)
          .refine(
            (val) => {
              const n = parseFloat(val.replace(",", "."));
              const celsius = unit === "F" ? fahrenheitToCelsius(n) : n;
              return celsius >= 34 && celsius <= 42.5;
            },
            t.temperature.validation.tempRange,
          ),
        notes: z.string().max(240, t.temperature.validation.notesMax).optional(),
      }),
    [t, unit],
  );

  const resolver: Resolver<EditFormData> = useCallback(
    (values, context, options) => zodResolver(EditSchema)(values, context, options),
    [EditSchema],
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditFormData>({ resolver });

  const handleOpenChange = (next: boolean) => {
    if (!next) setIsEditing(false);
    setOpen(next);
  };

  const startEditing = () => {
    const displayValue = unit === "F"
      ? celsiusToFahrenheit(reading.temperature).toFixed(1)
      : reading.temperature.toFixed(1);
    reset({ temperature: displayValue, notes: reading.notes ?? "" });
    setIsEditing(true);
  };

  const onSubmit: SubmitHandler<EditFormData> = async (data) => {
    try {
      const parsed = parseFloat(data.temperature.replace(",", "."));
      const celsius = unit === "F" ? fahrenheitToCelsius(parsed) : parsed;
      await updateReading(reading.id, { temperature: celsius, notes: data.notes });
      toast.success(t.temperature.editSuccess);
      setIsEditing(false);
    } catch {
      toast.error(t.temperature.editError);
    }
  };

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

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          {isEditing ? (
            <>
              <DialogHeader>
                <DialogTitle>{t.temperature.editTitle}</DialogTitle>
                <DialogDescription asChild>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(reading.recorded_at, "MMM dd, yyyy HH:mm", locale)}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="edit-temperature">
                    {t.temperature.temperatureLabel} ({unit === "F" ? t.temperature.unitFahrenheit : t.temperature.unitCelsius})
                  </Label>
                  <Input
                    id="edit-temperature"
                    type="text"
                    inputMode="decimal"
                    className={cn(errors.temperature && "border-red-500")}
                    {...register("temperature")}
                  />
                  {errors.temperature && (
                    <p className="text-red-500 text-xs mt-1">{errors.temperature.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="edit-notes">{t.temperature.notesLabel}</Label>
                  <Input
                    id="edit-notes"
                    type="text"
                    maxLength={240}
                    placeholder={t.temperature.notesPlaceholder}
                    className={cn(errors.notes && "border-red-500")}
                    {...register("notes")}
                  />
                  {errors.notes && (
                    <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                    {t.temperature.deleteCancel}
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? t.temperature.savingButton : t.temperature.saveButton}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between pr-6">
                  <span>{formatTemp(reading.temperature)}</span>
                  {userId && (
                    <Button variant="outline" size="sm" onClick={startEditing} className="gap-1.5">
                      <Pencil className="h-3.5 w-3.5" />
                      {t.temperature.editButton}
                    </Button>
                  )}
                </DialogTitle>
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
