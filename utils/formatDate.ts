import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PT_BR_DATE_FORMAT = "dd 'de' MMMM 'de' yyyy HH:mm";

export const formatDate = (date: Date | string, enFormat: string, locale: string): string => {
  const d = typeof date === "string" ? new Date(date) : date;

  if (locale === "pt-BR" && enFormat.includes("MMM")) {
    const raw = format(d, PT_BR_DATE_FORMAT, { locale: ptBR });
    // capitalize the month name: "28 de abril de 2026" → "28 de Abril de 2026"
    return raw.replace(/de ([a-záàâãéèêíïóôõöúüç]+)/i, (_, m) => `de ${m.charAt(0).toUpperCase()}${m.slice(1)}`);
  }

  return format(d, enFormat);
};

export const formatChartDate = (date: Date | string, locale?: string): string => {
  const d = typeof date === "string" ? new Date(date) : date;

  if (locale === "pt-BR") {
    // e.g. "abr." → "Abr", "mai." → "Mai"
    const raw = format(d, "MMM dd HH:mm", { locale: ptBR });
    return raw.replace(/^([a-záàâãéèêíïóôõöúüç]+)\.?/, (_, m) => m.charAt(0).toUpperCase() + m.slice(1));
  }

  return format(d, "MMM dd HH:mm");
};
