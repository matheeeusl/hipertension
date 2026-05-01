"use client";

import { useState, useMemo, useCallback } from "react";
import { Trash2, Pencil } from "lucide-react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Weight } from "@/interfaces/Weight";
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
import { useWeight } from "@/hooks/useWeight";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type EditFormData = {
  weight: string;
  notes?: string;
};

interface Props {
  reading: Weight;
  onDelete: (id: string) => void;
  userId?: string;
}

export const WeightTableRow = ({ reading, onDelete, userId }: Props) => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { t, locale } = useLocale();
  const { updateReading, isUpdating } = useWeight(userId ?? "");

  const EditSchema = useMemo(
    () =>
      z.object({
        weight: z
          .string()
          .regex(/^\d+([.,]\d+)?$/, t.weight.validation.weightNumbers)
          .min(1, t.weight.validation.weightMin)
          .refine(
            (val) => {
              const n = parseFloat(val.replace(",", "."));
              return n >= 20 && n <= 300;
            },
            t.weight.validation.weightRange,
          ),
        notes: z.string().max(240, t.weight.validation.notesMax).optional(),
      }),
    [t],
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
    reset({ weight: reading.weight.toFixed(2), notes: reading.notes ?? "" });
    setIsEditing(true);
  };

  const onSubmit: SubmitHandler<EditFormData> = async (data) => {
    try {
      const weight = parseFloat(data.weight.replace(",", "."));
      await updateReading(reading.id, { weight, notes: data.notes });
      toast.success(t.weight.editSuccess);
      setIsEditing(false);
    } catch {
      toast.error(t.weight.editError);
    }
  };

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

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          {isEditing ? (
            <>
              <DialogHeader>
                <DialogTitle>{t.weight.editTitle}</DialogTitle>
                <DialogDescription asChild>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(reading.recorded_at, "MMM dd, yyyy HH:mm", locale)}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="edit-weight">{t.weight.weightLabel}</Label>
                  <Input
                    id="edit-weight"
                    type="text"
                    inputMode="decimal"
                    className={cn(errors.weight && "border-red-500")}
                    {...register("weight")}
                  />
                  {errors.weight && (
                    <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="edit-notes">{t.weight.notesLabel}</Label>
                  <Input
                    id="edit-notes"
                    type="text"
                    maxLength={240}
                    placeholder={t.weight.notesPlaceholder}
                    className={cn(errors.notes && "border-red-500")}
                    {...register("notes")}
                  />
                  {errors.notes && (
                    <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                    {t.weight.deleteCancel}
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? t.weight.savingButton : t.weight.saveButton}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between pr-6">
                  <span>{reading.weight.toFixed(2)} kg</span>
                  {userId && (
                    <Button variant="outline" size="sm" onClick={startEditing} className="gap-1.5">
                      <Pencil className="h-3.5 w-3.5" />
                      {t.weight.editButton}
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
                  <span className="text-muted-foreground block mb-1">{t.weight.columns.notes}</span>
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
