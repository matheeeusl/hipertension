"use client";

import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";

export const LocaleSwitch = () => {
  const { locale, setLocale } = useLocale();

  const next = locale === "en" ? "pt-BR" : "en";
  const flag = locale === "en" ? "/flags/br.svg" : "/flags/en.svg";
  const label = locale === "en" ? "Mudar para Português" : "Switch to English";

  return (
    <button
      onClick={() => setLocale(next)}
      title={label}
      className="rounded overflow-hidden transition-opacity hover:opacity-75"
    >
      <Image src={flag} alt={label} width={24} height={16} />
    </button>
  );
};
