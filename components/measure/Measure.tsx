"use client";

import { useMemo, useEffect, useCallback } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBloodPressure } from "@/hooks/useBloodPressure";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/LocaleContext";
import { BloodPressureInput } from "@/interfaces/BloodPressure";

type MeasureFormData = {
  systolic_pressure: string;
  diastolic_pressure: string;
  notes?: string;
};

interface MeasureProps {
  userId?: string;
  onSave?: (reading: BloodPressureInput) => Promise<void>;
}

export const Measure = ({ userId, onSave }: MeasureProps) => {
  const { t } = useLocale();
  const { addReading, isAdding } = useBloodPressure(userId || "");

  const MeasureSchema = useMemo(
    () =>
      z.object({
        systolic_pressure: z
          .string()
          .regex(/^\d+$/, t.measure.validation.systolicNumbers)
          .min(2, t.measure.validation.systolicMin)
          .max(3, t.measure.validation.systolicMax)
          .refine(
            (val) => { const n = parseInt(val, 10); return n >= 70 && n <= 300; },
            t.measure.validation.systolicRange
          ),
        diastolic_pressure: z
          .string()
          .regex(/^\d+$/, t.measure.validation.diastolicNumbers)
          .min(2, t.measure.validation.diastolicMin)
          .max(3, t.measure.validation.diastolicMax)
          .refine(
            (val) => { const n = parseInt(val, 10); return n >= 40 && n <= 200; },
            t.measure.validation.diastolicRange
          ),
        notes: z.string().optional(),
      }),
    [t]
  );

  const resolver: Resolver<MeasureFormData> = useCallback(
    (values, context, options) =>
      zodResolver(MeasureSchema)(values, context, options),
    [MeasureSchema]
  );

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<MeasureFormData>({ resolver });

  useEffect(() => {
    const fieldsWithErrors = Object.keys(errors) as Array<keyof MeasureFormData>;
    if (fieldsWithErrors.length) trigger(fieldsWithErrors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const onSubmit: SubmitHandler<MeasureFormData> = async (data) => {
    const reading: BloodPressureInput = {
      systolic_pressure: parseInt(data.systolic_pressure, 10),
      diastolic_pressure: parseInt(data.diastolic_pressure, 10),
      notes: data.notes,
    };

    try {
      if (onSave) {
        await onSave(reading);
      } else {
        await addReading(reading);
      }
      toast.success(t.measure.successMessage);
      reset();
    } catch (error: unknown) {
      toast.error(t.measure.errorMessage, {
        description: (error as Error).message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{t.measure.title}</h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div className="flex gap-4">
              <div className="max-w-44 mb-4">
                <Label htmlFor="systolic_pressure">{t.measure.systolicLabel}</Label>
                <Input
                  type="number"
                  id="systolic_pressure"
                  placeholder="120"
                  className={cn("w-full", errors.systolic_pressure && "border-red-500")}
                  {...register("systolic_pressure")}
                />
                {errors.systolic_pressure && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.systolic_pressure.message}
                  </p>
                )}
              </div>
              <div className="max-w-44 mb-4">
                <Label htmlFor="diastolic_pressure">{t.measure.diastolicLabel}</Label>
                <Input
                  type="number"
                  id="diastolic_pressure"
                  placeholder="80"
                  className={cn("w-full", errors.diastolic_pressure && "border-red-500")}
                  {...register("diastolic_pressure")}
                />
                {errors.diastolic_pressure && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.diastolic_pressure.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="notes">{t.measure.notesLabel}</Label>
              <Input
                type="text"
                id="notes"
                placeholder={t.measure.notesPlaceholder}
                {...register("notes")}
              />
            </div>
          </div>
          <CardFooter className="mt-4 p-0">
            <Button type="submit" disabled={isAdding}>
              {isAdding ? t.measure.savingButton : t.measure.saveButton}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};
