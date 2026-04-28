"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";

interface Props {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export const HistoryPagination = ({ page, totalPages, onPrev, onNext }: Props) => {
  const { t } = useLocale();
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-3">
      <Button variant="outline" size="sm" onClick={onPrev} disabled={page === 1}>
        {t.history.previous}
      </Button>
      <span className="text-sm text-gray-500">
        {t.history.page} {page} {t.history.of} {totalPages}
      </span>
      <Button variant="outline" size="sm" onClick={onNext} disabled={page === totalPages}>
        {t.history.next}
      </Button>
    </div>
  );
};
