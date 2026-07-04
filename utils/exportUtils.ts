import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { BloodPressure } from "@/interfaces/BloodPressure";
import { Weight } from "@/interfaces/Weight";
import { Temperature } from "@/interfaces/Temperature";
import { getBPCategory } from "@/utils/bpCategory";
import { getTemperatureCategory } from "@/utils/temperatureCategory";
import { celsiusToFahrenheit } from "@/utils/measurementsChart";
import { FilterPeriod } from "@/utils/periodFilter";
import { Translations } from "@/locales/en";

type MeasurementType = "bp" | "weight" | "temperature";

const escapeCSV = (val: string | number | undefined | null): string => {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const formatRowDate = (recorded_at: string) => ({
  date: format(new Date(recorded_at), "yyyy-MM-dd"),
  time: format(new Date(recorded_at), "HH:mm"),
});

const getPeriodLabel = (period: FilterPeriod, filters: Translations["graph"]["filters"]): string =>
  filters[period] ?? period;

const buildFilename = (type: MeasurementType, period: FilterPeriod, ext: "csv" | "pdf"): string => {
  const typeLabel = { bp: "blood-pressure", weight: "weight", temperature: "temperature" }[type];
  const periodSlug = period.replace(/\s+/g, "-");
  const date = format(new Date(), "yyyy-MM-dd");
  return `${typeLabel}-history-${periodSlug}-${date}.${ext}`;
};

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportBPToCSV = (
  data: BloodPressure[],
  period: FilterPeriod,
  t: Translations
) => {
  const headers = [t.graph.dateLabel, t.export.time, t.export.systolicMmhg, t.export.diastolicMmhg, t.history.columns.category, t.history.columns.notes];
  const rows = data.map((r) => {
    const { date, time } = formatRowDate(r.recorded_at);
    const category = getBPCategory(r.systolic_pressure, r.diastolic_pressure, t.history.categories).text;
    return [date, time, r.systolic_pressure, r.diastolic_pressure, category, r.notes ?? ""].map(escapeCSV).join(",");
  });
  const csv = [headers.join(","), ...rows].join("\n");
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), buildFilename("bp", period, "csv"));
};

export const exportWeightToCSV = (data: Weight[], period: FilterPeriod, t: Translations) => {
  const headers = [t.graph.dateLabel, t.export.time, t.weight.weightLabel, t.history.columns.notes];
  const rows = data.map((r) => {
    const { date, time } = formatRowDate(r.recorded_at);
    return [date, time, r.weight, r.notes ?? ""].map(escapeCSV).join(",");
  });
  const csv = [headers.join(","), ...rows].join("\n");
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), buildFilename("weight", period, "csv"));
};

export const exportTemperatureToCSV = (
  data: Temperature[],
  period: FilterPeriod,
  t: Translations
) => {
  const headers = [t.graph.dateLabel, t.export.time, `${t.temperature.columns.temperature} (°C)`, `${t.temperature.columns.temperature} (°F)`, t.temperature.columns.category, t.temperature.columns.notes];
  const rows = data.map((r) => {
    const { date, time } = formatRowDate(r.recorded_at);
    const f = celsiusToFahrenheit(r.temperature);
    const category = getTemperatureCategory(r.temperature, t.temperature.categories).text;
    return [date, time, r.temperature, f, category, r.notes ?? ""].map(escapeCSV).join(",");
  });
  const csv = [headers.join(","), ...rows].join("\n");
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), buildFilename("temperature", period, "csv"));
};

export const captureChartImage = async (el: HTMLElement): Promise<string> => {
  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: "#ffffff",
    logging: false,
    useCORS: true,
  });
  return canvas.toDataURL("image/png");
};

const MM_PAGE_WIDTH = 210;
const MM_LEFT = 15;
const MM_RIGHT = MM_PAGE_WIDTH - 15;
const MM_CONTENT_WIDTH = MM_RIGHT - MM_LEFT;
const MM_PAGE_HEIGHT = 297;
const MM_BOTTOM_MARGIN = 20;

const addPageIfNeeded = (doc: jsPDF, y: number, lineHeight: number): number => {
  if (y + lineHeight > MM_PAGE_HEIGHT - MM_BOTTOM_MARGIN) {
    doc.addPage();
    return 20;
  }
  return y;
};

const addFooter = (doc: jsPDF, pageNum: number, totalPages: number, t: Translations) => {
  const y = MM_PAGE_HEIGHT - 10;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`${t.history.page} ${pageNum} ${t.history.of} ${totalPages}`, MM_RIGHT, y, { align: "right" });
};

export const exportBPToPDF = async (
  data: BloodPressure[],
  period: FilterPeriod,
  chartImageDataUrl: string,
  t: Translations
) => {
  const doc = new jsPDF("p", "mm", "a4");
  const periodLabel = getPeriodLabel(period, t.graph.filters);
  let y = 20;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(`${t.history.title} — ${periodLabel}`, MM_LEFT, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`${t.export.exportedOn}: ${format(new Date(), t.export.exportedOnDateFormat)}`, MM_LEFT, y);
  y += 5;

  doc.setDrawColor(200, 200, 200);
  doc.line(MM_LEFT, y, MM_RIGHT, y);
  y += 8;

  const chartH = 64;
  doc.addImage(chartImageDataUrl, "PNG", MM_LEFT, y, MM_CONTENT_WIDTH, chartH);
  y += chartH + 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(t.export.dataTable, MM_LEFT, y);
  y += 6;

  const colWidths = [28, 18, 26, 26, 46, 0];
  const headers = [t.graph.dateLabel, t.export.time, t.history.columns.systolic, t.history.columns.diastolic, t.history.columns.category, t.history.columns.notes];
  colWidths[5] = MM_CONTENT_WIDTH - colWidths.slice(0, 5).reduce((a, b) => a + b, 0);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  let xOff = MM_LEFT;
  headers.forEach((h, i) => {
    doc.text(h, xOff, y);
    xOff += colWidths[i];
  });
  y += 1;
  doc.setDrawColor(180, 180, 180);
  doc.line(MM_LEFT, y, MM_RIGHT, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  const lineH = 6;

  for (const r of data) {
    y = addPageIfNeeded(doc, y, lineH);
    const { date, time } = formatRowDate(r.recorded_at);
    const category = getBPCategory(r.systolic_pressure, r.diastolic_pressure, t.history.categories).text;
    const row = [date, time, String(r.systolic_pressure), String(r.diastolic_pressure), category, r.notes ?? ""];
    xOff = MM_LEFT;
    row.forEach((val, i) => {
      const maxW = colWidths[i] - 1;
      const truncated = doc.splitTextToSize(val, maxW)[0] ?? "";
      doc.text(truncated, xOff, y);
      xOff += colWidths[i];
    });
    y += lineH;
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addFooter(doc, p, totalPages, t);
  }

  doc.save(buildFilename("bp", period, "pdf"));
};

export const exportWeightToPDF = async (
  data: Weight[],
  period: FilterPeriod,
  chartImageDataUrl: string,
  t: Translations
) => {
  const doc = new jsPDF("p", "mm", "a4");
  const periodLabel = getPeriodLabel(period, t.graph.filters);
  let y = 20;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(`${t.weight.historyTitle} — ${periodLabel}`, MM_LEFT, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`${t.export.exportedOn}: ${format(new Date(), t.export.exportedOnDateFormat)}`, MM_LEFT, y);
  y += 5;

  doc.setDrawColor(200, 200, 200);
  doc.line(MM_LEFT, y, MM_RIGHT, y);
  y += 8;

  const chartH = 64;
  doc.addImage(chartImageDataUrl, "PNG", MM_LEFT, y, MM_CONTENT_WIDTH, chartH);
  y += chartH + 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(t.export.dataTable, MM_LEFT, y);
  y += 6;

  const colWidths = [28, 18, 30, 0];
  const headers = [t.graph.dateLabel, t.export.time, t.weight.weightLabel, t.history.columns.notes];
  colWidths[3] = MM_CONTENT_WIDTH - colWidths.slice(0, 3).reduce((a, b) => a + b, 0);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  let xOff = MM_LEFT;
  headers.forEach((h, i) => {
    doc.text(h, xOff, y);
    xOff += colWidths[i];
  });
  y += 1;
  doc.setDrawColor(180, 180, 180);
  doc.line(MM_LEFT, y, MM_RIGHT, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  const lineH = 6;

  for (const r of data) {
    y = addPageIfNeeded(doc, y, lineH);
    const { date, time } = formatRowDate(r.recorded_at);
    const row = [date, time, String(r.weight), r.notes ?? ""];
    xOff = MM_LEFT;
    row.forEach((val, i) => {
      const truncated = doc.splitTextToSize(val, colWidths[i] - 1)[0] ?? "";
      doc.text(truncated, xOff, y);
      xOff += colWidths[i];
    });
    y += lineH;
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addFooter(doc, p, totalPages, t);
  }

  doc.save(buildFilename("weight", period, "pdf"));
};

export const exportTemperatureToPDF = async (
  data: Temperature[],
  period: FilterPeriod,
  chartImageDataUrl: string,
  unit: "C" | "F",
  t: Translations
) => {
  const doc = new jsPDF("p", "mm", "a4");
  const periodLabel = getPeriodLabel(period, t.graph.filters);
  const unitLabel = unit === "C" ? "°C" : "°F";
  let y = 20;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(`${t.temperature.historyTitle} — ${periodLabel}`, MM_LEFT, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`${t.export.exportedOn}: ${format(new Date(), t.export.exportedOnDateFormat)}`, MM_LEFT, y);
  y += 5;

  doc.setDrawColor(200, 200, 200);
  doc.line(MM_LEFT, y, MM_RIGHT, y);
  y += 8;

  const chartH = 64;
  doc.addImage(chartImageDataUrl, "PNG", MM_LEFT, y, MM_CONTENT_WIDTH, chartH);
  y += chartH + 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(t.export.dataTable, MM_LEFT, y);
  y += 6;

  const colWidths = [28, 18, 30, 42, 0];
  const headers = [t.graph.dateLabel, t.export.time, `${t.temperature.columns.temperature} (${unitLabel})`, t.temperature.columns.category, t.temperature.columns.notes];
  colWidths[4] = MM_CONTENT_WIDTH - colWidths.slice(0, 4).reduce((a, b) => a + b, 0);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  let xOff = MM_LEFT;
  headers.forEach((h, i) => {
    doc.text(h, xOff, y);
    xOff += colWidths[i];
  });
  y += 1;
  doc.setDrawColor(180, 180, 180);
  doc.line(MM_LEFT, y, MM_RIGHT, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  const lineH = 6;

  for (const r of data) {
    y = addPageIfNeeded(doc, y, lineH);
    const { date, time } = formatRowDate(r.recorded_at);
    const displayTemp = unit === "F" ? celsiusToFahrenheit(r.temperature) : r.temperature;
    const category = getTemperatureCategory(r.temperature, t.temperature.categories).text;
    const row = [date, time, String(displayTemp), category, r.notes ?? ""];
    xOff = MM_LEFT;
    row.forEach((val, i) => {
      const truncated = doc.splitTextToSize(val, colWidths[i] - 1)[0] ?? "";
      doc.text(truncated, xOff, y);
      xOff += colWidths[i];
    });
    y += lineH;
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addFooter(doc, p, totalPages, t);
  }

  doc.save(buildFilename("temperature", period, "pdf"));
};
