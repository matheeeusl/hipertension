"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Measure } from "@/components/measure/Measure";
import { LocalReadingsView } from "@/components/measure/LocalReadingsView";
import { useAuth } from "@/hooks/useAuth";
import { useLocalReadings } from "@/hooks/useLocalReadings";
import { PageContainer } from "@/components/shared/PageContainer";

export default function MeasurePage() {
  const { user, loading } = useAuth();
  const { readings, addReading, deleteReading } = useLocalReadings();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (user) return null;

  return (
    <PageContainer>
      <Measure onSave={addReading} />
      <div className="mt-4 max-w-3xl w-full">
        <LocalReadingsView readings={readings} onDelete={deleteReading} />
      </div>
    </PageContainer>
  );
}
