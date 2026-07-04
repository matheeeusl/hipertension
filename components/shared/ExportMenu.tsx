"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportMenuProps {
  onExportCSV: () => void;
  onExportPDF: () => Promise<void>;
  isExporting: boolean;
  disabled?: boolean;
  labels?: {
    button?: string;
    exporting?: string;
    csv?: string;
    pdf?: string;
  };
}

export const ExportMenu = ({ onExportCSV, onExportPDF, isExporting, disabled, labels }: ExportMenuProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const handleCSV = () => {
    setOpen(false);
    onExportCSV();
  };

  const handlePDF = async () => {
    setOpen(false);
    await onExportPDF();
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled || isExporting}
        className="flex items-center gap-1.5"
      >
        {isExporting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Download size={14} />
        )}
        {isExporting ? (labels?.exporting ?? "Exporting...") : (labels?.button ?? "Export")}
      </Button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-40 rounded-md border bg-background shadow-md">
          <button
            onClick={handleCSV}
            className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors rounded-t-md"
          >
            {labels?.csv ?? "Export as CSV"}
          </button>
          <button
            onClick={handlePDF}
            className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors rounded-b-md"
          >
            {labels?.pdf ?? "Export as PDF"}
          </button>
        </div>
      )}
    </div>
  );
};
