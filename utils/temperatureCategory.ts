import { Translations } from "@/locales/en";

type TempCategories = Translations["temperature"]["categories"];

export const getTemperatureCategory = (
  celsius: number,
  categories: TempCategories
): { text: string; color: string } => {
  if (celsius > 40)
    return { text: categories.hyperthermia, color: "text-red-900" };
  if (celsius >= 39.1)
    return { text: categories.highFever, color: "text-red-600" };
  if (celsius >= 38.1)
    return { text: categories.fever, color: "text-orange-600" };
  if (celsius >= 37.3)
    return { text: categories.lowGradeFever, color: "text-yellow-600" };
  if (celsius >= 36.1)
    return { text: categories.normal, color: "text-green-600" };
  if (celsius >= 35)
    return { text: categories.belowNormal, color: "text-blue-600" };
  return { text: categories.hypothermia, color: "text-purple-700" };
};
