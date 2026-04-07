"use client";

import { Measure } from "@/components/measure/Measure";
import { LocalReadingsView } from "@/components/measure/LocalReadingsView";
import { useAuth } from "@/hooks/useAuth";
import { useLocalReadings } from "@/hooks/useLocalReadings";
import { PageContainer } from "@/components/shared/PageContainer";

export default function MeasurePage() {
  const { user, loading } = useAuth();
  const { readings, addReading, deleteReading } = useLocalReadings();

  if (loading) return null;

  if (user) {
    return (
      <PageContainer>
        <Measure userId={user.id} />
        <div className="mt-4 max-w-3xl w-full">
          <LocalReadingsView userId={user.id} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Measure onSave={addReading} />
      <div className="mt-4 max-w-3xl w-full">
        <LocalReadingsView readings={readings} onDelete={deleteReading} />
      </div>
    </PageContainer>
  );
}
