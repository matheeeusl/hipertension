"use client";

import { useState, useMemo, useCallback } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil } from "lucide-react";
import { BloodPressure } from "@/interfaces/BloodPressure";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLocale } from "@/contexts/LocaleContext";
import { useBloodPressure } from "@/hooks/useBloodPressure";
import { getBPCategory } from "@/utils/bpCategory";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type EditFormData = {
  systolic_pressure: string;
  diastolic_pressure: string;
  notes?: string;
};

interface Props {
  reading: BloodPressure;
  categories: Parameters<typeof getBPCategory>[2];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

export const ReadingDialog = ({ reading, categories, open, onOpenChange, userId }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const { locale, t } = useLocale();
  const { updateReading, isUpdating } = useBloodPressure(userId ?? "");

  const category = getBPCategory(reading.systolic_pressure, reading.diastolic_pressure, categories);

  const EditSchema = useMemo(
    () =>
      z.object({
        systolic_pressure: z
          .string()
          .regex(/^\d+$/, t.measure.validation.systolicNumbers)
          .min(2, t.measure.validation.systolicMin)
          .max(3, t.measure.validation.systolicMax)
          .refine(
            (val) => { const n = parseInt(val, 10); return n >= 70 && n <= 300; },
            t.measure.validation.systolicRange,
          ),
        diastolic_pressure: z
          .string()
          .regex(/^\d+$/, t.measure.validation.diastolicNumbers)
          .min(2, t.measure.validation.diastolicMin)
          .max(3, t.measure.validation.diastolicMax)
          .refine(
            (val) => { const n = parseInt(val, 10); return n >= 40 && n <= 200; },
            t.measure.validation.diastolicRange,
          ),
        notes: z.string().max(240, t.measure.validation.notesMax).optional(),
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
    onOpenChange(next);
  };

  const startEditing = () => {
    reset({
      systolic_pressure: String(reading.systolic_pressure),
      diastolic_pressure: String(reading.diastolic_pressure),
      notes: reading.notes ?? "",
    });
    setIsEditing(true);
  };

  const onSubmit: SubmitHandler<EditFormData> = async (data) => {
    try {
      await updateReading(reading.id, {
        systolic_pressure: parseInt(data.systolic_pressure, 10),
        diastolic_pressure: parseInt(data.diastolic_pressure, 10),
        notes: data.notes,
      });
      toast.success(t.history.editSuccess);
      setIsEditing(false);
    } catch {
      toast.error(t.history.editError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {isEditing ? (
          <>
            <DialogHeader>
              <DialogTitle>{t.history.editTitle}</DialogTitle>
              <DialogDescription asChild>
                <span className="text-sm text-muted-foreground">
                  {formatDate(reading.recorded_at, "MMM dd, yyyy HH:mm", locale)}
                </span>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="edit-systolic">{t.measure.systolicLabel}</Label>
                  <Input
                    id="edit-systolic"
                    type="number"
                    className={cn(errors.systolic_pressure && "border-red-500")}
                    {...register("systolic_pressure")}
                  />
                  {errors.systolic_pressure && (
                    <p className="text-red-500 text-xs mt-1">{errors.systolic_pressure.message}</p>
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="edit-diastolic">{t.measure.diastolicLabel}</Label>
                  <Input
                    id="edit-diastolic"
                    type="number"
                    className={cn(errors.diastolic_pressure && "border-red-500")}
                    {...register("diastolic_pressure")}
                  />
                  {errors.diastolic_pressure && (
                    <p className="text-red-500 text-xs mt-1">{errors.diastolic_pressure.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="edit-notes">{t.measure.notesLabel}</Label>
                <Input
                  id="edit-notes"
                  type="text"
                  maxLength={240}
                  placeholder={t.measure.notesPlaceholder}
                  className={cn(errors.notes && "border-red-500")}
                  {...register("notes")}
                />
                {errors.notes && (
                  <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                  {t.history.deleteCancel}
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? t.measure.savingButton : t.measure.saveButton}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between pr-6">
                <span>{reading.systolic_pressure} / {reading.diastolic_pressure} mmHg</span>
                {userId && (
                  <Button variant="outline" size="sm" onClick={startEditing} className="gap-1.5">
                    <Pencil className="h-3.5 w-3.5" />
                    {t.history.editButton}
                  </Button>
                )}
              </DialogTitle>
              <DialogDescription asChild>
                <span className={`text-sm font-medium ${category.color}`}>
                  {category.text}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">{t.history.columns.dateTime}</span>
                <span>{formatDate(reading.recorded_at, "MMM dd, yyyy HH:mm", locale)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">{t.history.columns.systolic}</span>
                <span className="font-medium">{reading.systolic_pressure} mmHg</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">{t.history.columns.diastolic}</span>
                <span className="font-medium">{reading.diastolic_pressure} mmHg</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">{t.history.columns.notes}</span>
                <p className="text-foreground whitespace-pre-wrap break-words rounded-md bg-muted p-3 min-h-[60px]">
                  {reading.notes || "—"}
                </p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
