import { Metadata } from "next";

export const metadata: Metadata = { title: "Temperature" };

export default function TemperatureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
