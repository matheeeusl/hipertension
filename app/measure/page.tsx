"use client";

import { Measure } from "@/components/measure/Measure";
import { LocalReadingsView } from "@/components/measure/LocalReadingsView";
import { useAuth } from "@/hooks/useAuth";
import { useLocalReadings } from "@/hooks/useLocalReadings";

export default function MeasurePage() {
  const { user, loading } = useAuth();
  const { readings, addReading, deleteReading } = useLocalReadings();

  if (loading) return null;

  if (user) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col gap-4 p-4">
        <Measure userId={user.id} />
        <div className="mt-4 max-w-3xl w-full">
          <LocalReadingsView userId={user.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen flex-col gap-4 p-4">
      <Measure onSave={addReading} />
      <div className="mt-4 max-w-3xl w-full">
        <LocalReadingsView readings={readings} onDelete={deleteReading} />
      </div>
    </div>
  );
}
