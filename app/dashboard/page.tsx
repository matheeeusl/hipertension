"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { PageContainer } from "@/components/shared/PageContainer";
import { Measure } from "@/components/measure/Measure";
import { History } from "@/components/history/History";
import { WeightForm } from "@/components/weight/WeightForm";
import { WeightHistory } from "@/components/weight/WeightHistory";
import { TemperatureForm } from "@/components/temperature/TemperatureForm";
import { TemperatureHistory } from "@/components/temperature/TemperatureHistory";
import { Graph } from "@/components/graph/Graph";
import { useLocale } from "@/contexts/LocaleContext";

type Slide = "bp" | "weight" | "temperature";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLocale();
  const [activeSlide, setActiveSlide] = useState<Slide>("bp");

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const tabs: { id: Slide; label: string }[] = [
    { id: "bp", label: t.graph.title },
    { id: "weight", label: t.nav.weight },
    { id: "temperature", label: t.nav.temperature },
  ];

  return (
    <PageContainer>
      <div className="max-w-3xl w-full">
        <div className="flex border-b mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSlide(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeSlide === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {activeSlide === "bp" && <Measure userId={user.id} />}
          {activeSlide === "weight" && <WeightForm userId={user.id} />}
          {activeSlide === "temperature" && <TemperatureForm userId={user.id} />}
        </div>
      </div>

      <div className="mt-6 max-w-3xl w-full">
        <Graph userId={user.id} />
      </div>

      <div className="mt-4 max-w-3xl w-full">
        {activeSlide === "bp" && <History userId={user.id} />}
        {activeSlide === "weight" && <WeightHistory userId={user.id} />}
        {activeSlide === "temperature" && <TemperatureHistory userId={user.id} />}
      </div>
    </PageContainer>
  );
}
