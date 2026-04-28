"use client";

import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

interface Props<T extends string> {
  column: T;
  label: string;
  sortColumn: T | null;
  sortDirection: "asc" | "desc";
  onSort: (col: T) => void;
}

export const SortableHead = <T extends string>({
  column,
  label,
  sortColumn,
  sortDirection,
  onSort,
}: Props<T>) => {
  const isActive = sortColumn === column;
  const Icon = isActive ? (sortDirection === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => onSort(column)}>
      <span className="inline-flex items-center gap-1">
        {label}
        <Icon size={14} className={isActive ? "text-foreground" : "text-muted-foreground"} />
      </span>
    </TableHead>
  );
};
