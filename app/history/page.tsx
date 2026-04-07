"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { History } from "@/components/history/History";
import { useAuth } from "@/hooks/useAuth";

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <History userId={user.id} />
    </div>
  );
}
