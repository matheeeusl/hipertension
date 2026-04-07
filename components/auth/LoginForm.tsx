"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/contexts/LocaleContext";
import { useAddBloodPressureReadingMutation } from "@/api/bloodPressureApi";
import { STORAGE_KEY } from "@/hooks/useLocalReadings";
import { BloodPressure } from "@/interfaces/BloodPressure";

export const LoginForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [addReading] = useAddBloodPressureReadingMutation();

  const AuthSchema = z.object({
    email: z.string().email(t.auth.emailInvalid),
    password: z.string().min(6, t.auth.passwordMin),
  });

  type AuthFormData = z.infer<typeof AuthSchema>;

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(AuthSchema),
  });

  useEffect(() => {
    const fieldsWithErrors = Object.keys(errors) as Array<keyof AuthFormData>;
    if (fieldsWithErrors.length) trigger(fieldsWithErrors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const onSubmit: SubmitHandler<AuthFormData> = async ({ email, password }) => {
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success(t.auth.accountCreated);
      } else {
        const user = await signIn(email, password);
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const localReadings: BloodPressure[] = JSON.parse(stored);
          await Promise.all(
            localReadings.map(({ systolic_pressure, diastolic_pressure, notes, tags }) =>
              addReading({ reading: { systolic_pressure, diastolic_pressure, notes, tags: tags ?? undefined }, userId: user.id }).unwrap()
            )
          );
          sessionStorage.removeItem(STORAGE_KEY);
        }
        router.push("/measure");
      }
    } catch (error: unknown) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h2 className="text-xl font-semibold">
            {isSignUp ? t.auth.createAccount : t.auth.signIn}
          </h2>
          <p className="text-sm text-gray-500">
            {isSignUp ? t.auth.startTracking : t.auth.welcomeBack}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t.auth.emailPlaceholder}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">{t.auth.password}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
            <CardFooter className="p-0 flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? isSignUp
                    ? t.auth.creatingAccount
                    : t.auth.signingIn
                  : isSignUp
                  ? t.auth.createAccount
                  : t.auth.signIn}
              </Button>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                {isSignUp ? t.auth.alreadyHaveAccount : t.auth.dontHaveAccount}
              </button>
              <Link
                href="/measure"
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                {t.auth.continueWithout}
              </Link>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
