"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { WeightForm } from "@/components/weight/WeightForm";
import { WeightReadingsView } from "@/components/weight/WeightReadingsView";
import { PageContainer } from "@/components/shared/PageContainer";

export default function WeightPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <PageContainer>
      <WeightForm userId={user.id} />
      <div className="mt-4 max-w-3xl w-full">
        <WeightReadingsView userId={user.id} />
      </div>
    </PageContainer>
  );
}
