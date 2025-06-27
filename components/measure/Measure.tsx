"use client";

import { useForm, SubmitHandler } from "react-hook-form";
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
import { toast, Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMounted } from "@/hooks/useIsMounted";

const MeasureSchema = z.object({
  systolic_pressure: z
    .string()
    .regex(/^\d+$/, "Systolic pressure must contain only numbers")
    .min(2, "Systolic pressure must have at least 2 digits")
    .max(3, "Systolic pressure must have at most 3 digits")
    .refine((val) => {
      const num = parseInt(val, 10);
      return num >= 70 && num <= 300;
    }, "Systolic pressure must be between 70 and 300"),
  diastolic_pressure: z
    .string()
    .regex(/^\d+$/, "Diastolic pressure must contain only numbers")
    .min(2, "Diastolic pressure must have at least 2 digits")
    .max(3, "Diastolic pressure must have at most 3 digits")
    .refine((val) => {
      const num = parseInt(val, 10);
      return num >= 40 && num <= 200;
    }, "Diastolic pressure must be between 40 and 200"),
  notes: z.string().optional(),
});

type MeasureFormData = z.infer<typeof MeasureSchema>;

const userId = process.env.NEXT_PUBLIC_USER_ID || "";

export const Measure = () => {
  const isMounted = useIsMounted();

  const { addReading, isAdding } = useBloodPressure(userId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MeasureFormData>({
    resolver: zodResolver(MeasureSchema),
  });

  if (!isMounted) return null; // Prevent hydration mismatch

  const onSubmit: SubmitHandler<MeasureFormData> = async (data) => {
    const reading = {
      systolic_pressure: parseInt(data.systolic_pressure, 10),
      diastolic_pressure: parseInt(data.diastolic_pressure, 10),
      notes: data.notes,
    };

    try {
      await addReading(reading);
      toast.success("Blood pressure reading saved successfully!");
      reset(); // Clear form after successful submission
    } catch (error: unknown) {
      toast.error("Failed to save reading", {
        description: (error as Error).message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Record Blood Pressure</h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div className="flex gap-4">
              <div className="max-w-44 mb-4">
                <Label htmlFor="systolic_pressure">
                  Systolic Pressure (Upper)
                </Label>
                <Input
                  type="number"
                  id="systolic_pressure"
                  placeholder="120"
                  className={cn(
                    "w-100",
                    errors.systolic_pressure && "border-red-500"
                  )}
                  {...register("systolic_pressure")}
                />
                {errors.systolic_pressure && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.systolic_pressure.message}
                  </p>
                )}
              </div>
              <div className="max-w-44 mb-4">
                <Label htmlFor="diastolic_pressure">
                  Diastolic Pressure (Lower)
                </Label>
                <Input
                  type="number"
                  id="diastolic_pressure"
                  placeholder="80"
                  className={cn(
                    "w-100",
                    errors.diastolic_pressure && "border-red-500"
                  )}
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
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                type="text"
                id="notes"
                placeholder="e.g., after exercise, morning reading..."
                {...register("notes")}
              />
            </div>
            <Toaster richColors />
          </div>
          <CardFooter className="mt-4 p-0">
            <Button type="submit" disabled={isAdding}>
              {isAdding ? "Saving..." : "Save Reading"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};
