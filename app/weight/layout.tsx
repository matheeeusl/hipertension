import { Metadata } from "next";

export const metadata: Metadata = { title: "Weight" };

export default function WeightLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
