"use client";

import { useMemo, useEffect, useCallback, useState } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTemperature } from "@/hooks/useTemperature";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/LocaleContext";
import { fahrenheitToCelsius } from "@/utils/temperatureChart";

type TempUnit = "C" | "F";

type TemperatureFormData = {
  temperature: string;
  recordedAt?: string;
  notes?: string;
};

const toLocalDatetimeValue = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const TemperatureForm = ({ userId }: { userId: string }) => {
  const { t, locale } = useLocale();
  const { addReading, isAdding } = useTemperature(userId);
  const [unit, setUnit] = useState<TempUnit>(locale === "en" ? "F" : "C");

  useEffect(() => {
    setUnit(locale === "en" ? "F" : "C");
  }, [locale]);

  const TemperatureSchema = useMemo(
    () =>
      z.object({
        temperature: z
          .string()
          .regex(/^\d+(\.\d{1,2})?$/, t.temperature.validation.tempNumbers)
          .refine((val) => {
            const n = parseFloat(val);
            return unit === "C" ? n >= 34 && n <= 42 : n >= 93.2 && n <= 107.6;
          }, t.temperature.validation.tempRange),
        recordedAt: z.string().optional(),
        notes: z.string().max(240, t.temperature.validation.notesMax).optional(),
      }),
    [t, unit]
  );

  const resolver: Resolver<TemperatureFormData> = useCallback(
    (values, context, options) => zodResolver(TemperatureSchema)(values, context, options),
    [TemperatureSchema]
  );

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<TemperatureFormData>({ resolver });

  useEffect(() => {
    const fieldsWithErrors = Object.keys(errors) as Array<keyof TemperatureFormData>;
    if (fieldsWithErrors.length) trigger(fieldsWithErrors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, unit]);

  const onSubmit: SubmitHandler<TemperatureFormData> = async (data) => {
    try {
      const raw = parseFloat(data.temperature);
      const celsius = unit === "F" ? fahrenheitToCelsius(raw) : raw;
      const recorded_at = data.recordedAt
        ? new Date(data.recordedAt).toISOString()
        : new Date().toISOString();
      await addReading({ temperature: celsius, notes: data.notes, recorded_at });
      toast.success(t.temperature.successMessage);
      reset();
    } catch (error: unknown) {
      toast.error(t.temperature.errorMessage, { description: (error as Error).message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{t.temperature.title}</h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <Label htmlFor="temperature">{t.temperature.temperatureLabel}</Label>
                <div className="flex gap-2 items-start">
                  <div>
                    <Input
                      type="number"
                      id="temperature"
                      step="0.1"
                      placeholder={unit === "C" ? "37.0" : "98.6"}
                      className={cn("w-28", errors.temperature && "border-red-500")}
                      {...register("temperature")}
                    />
                    {errors.temperature && (
                      <p className="text-red-500 text-xs mt-1">{errors.temperature.message}</p>
                    )}
                  </div>
                  <div className="flex border rounded-md overflow-hidden h-10">
                    <button
                      type="button"
                      onClick={() => setUnit("C")}
                      className={`px-3 text-sm font-medium transition-colors ${
                        unit === "C"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.temperature.unitCelsius}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit("F")}
                      className={`px-3 text-sm font-medium transition-colors ${
                        unit === "F"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.temperature.unitFahrenheit}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-48">
                <Label htmlFor="recordedAt">{t.temperature.recordedAtLabel}</Label>
                <Input
                  type="datetime-local"
                  id="recordedAt"
                  max={toLocalDatetimeValue(new Date())}
                  className="w-full"
                  {...register("recordedAt")}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">{t.temperature.notesLabel}</Label>
              <Input
                type="text"
                id="notes"
                maxLength={240}
                placeholder={t.temperature.notesPlaceholder}
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
              {isAdding ? t.temperature.savingButton : t.temperature.saveButton}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};
