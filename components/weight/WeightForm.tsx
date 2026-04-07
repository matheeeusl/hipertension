"use client";

import { useMemo, useEffect, useCallback } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWeight } from "@/hooks/useWeight";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/LocaleContext";

type WeightFormData = {
  weight: string;
  notes?: string;
};

export const WeightForm = ({ userId }: { userId: string }) => {
  const { t } = useLocale();
  const { addReading, isAdding } = useWeight(userId);

  const WeightSchema = useMemo(
    () =>
      z.object({
        weight: z
          .string()
          .regex(/^\d+(\.\d{1,2})?$/, t.weight.validation.weightNumbers)
          .refine((val) => val.replace(".", "").length >= 1, t.weight.validation.weightMin)
          .refine((val) => {
            const n = parseFloat(val);
            return n >= 20 && n <= 300;
          }, t.weight.validation.weightRange),
        notes: z.string().max(240, t.weight.validation.notesMax).optional(),
      }),
    [t]
  );

  const resolver: Resolver<WeightFormData> = useCallback(
    (values, context, options) => zodResolver(WeightSchema)(values, context, options),
    [WeightSchema]
  );

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<WeightFormData>({ resolver });

  useEffect(() => {
    const fieldsWithErrors = Object.keys(errors) as Array<keyof WeightFormData>;
    if (fieldsWithErrors.length) trigger(fieldsWithErrors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const onSubmit: SubmitHandler<WeightFormData> = async (data) => {
    try {
      await addReading({ weight: parseFloat(data.weight), notes: data.notes });
      toast.success(t.weight.successMessage);
      reset();
    } catch (error: unknown) {
      toast.error(t.weight.errorMessage, { description: (error as Error).message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{t.weight.title}</h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="max-w-44">
              <Label htmlFor="weight">{t.weight.weightLabel}</Label>
              <Input
                type="number"
                id="weight"
                step="0.1"
                placeholder="70.5"
                className={cn("w-full", errors.weight && "border-red-500")}
                {...register("weight")}
              />
              {errors.weight && (
                <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="notes">{t.weight.notesLabel}</Label>
              <Input
                type="text"
                id="notes"
                maxLength={240}
                placeholder={t.weight.notesPlaceholder}
                className={cn(errors.notes && "border-red-500")}
                {...register("notes")}
              />
              {errors.notes && (
                <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>
              )}
            </div>
          </div>
          <CardFooter className="mt-4 p-0">
            <Button type="submit" disabled={isAdding}>
              {isAdding ? t.weight.savingButton : t.weight.saveButton}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};
