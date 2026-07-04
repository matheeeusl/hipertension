export type FilterPeriod = "3days" | "1week" | "1month" | "3months" | "all";

export const getPeriodCutoff = (period: FilterPeriod): Date | null => {
  if (period === "all") return null;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  if (period === "3days") cutoff.setDate(cutoff.getDate() - 2);
  if (period === "1week") cutoff.setDate(cutoff.getDate() - 7);
  if (period === "1month") cutoff.setMonth(cutoff.getMonth() - 1);
  if (period === "3months") cutoff.setMonth(cutoff.getMonth() - 3);
  return cutoff;
};

export const filterByPeriod = <T extends { recorded_at: string }>(
  data: T[],
  period: FilterPeriod
): T[] => {
  const cutoff = getPeriodCutoff(period);
  return cutoff ? data.filter((r) => new Date(r.recorded_at) >= cutoff) : [...data];
};
