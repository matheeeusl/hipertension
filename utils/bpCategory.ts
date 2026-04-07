import { Translations } from "@/locales/en";

type Categories = Translations["history"]["categories"];

export const getBPCategory = (
  systolic: number,
  diastolic: number,
  categories: Categories
): { text: string; color: string } => {
  if (systolic >= 180 || diastolic >= 120)
    return { text: categories.crisis, color: "text-red-900" };
  if (systolic < 80 || diastolic < 50)
    return { text: categories.lowSevere, color: "text-purple-700" };
  if (systolic >= 140 || diastolic >= 90)
    return { text: categories.stage2, color: "text-red-600" };
  if (systolic >= 130 || diastolic >= 80)
    return { text: categories.stage1, color: "text-orange-600" };
  if (systolic >= 120 && diastolic < 80)
    return { text: categories.elevated, color: "text-yellow-600" };
  if (systolic < 90 || diastolic < 60)
    return { text: categories.low, color: "text-blue-600" };
  return { text: categories.normal, color: "text-green-600" };
};
