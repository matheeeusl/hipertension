import { Metadata } from "next";

export const metadata: Metadata = { title: "Measure" };

export default function MeasureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
