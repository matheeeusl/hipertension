import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Metadata } from "next";
import Wrapper from "@/components/wrapper/wrapper";
import { NavMenu } from "@/components/nav/NavMenu";
import { Footer } from "@/components/shared/Footer";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Blood Pressure",
    template: "Blood Pressure | %s",
  },
  description: "Laureano",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Wrapper>
          <NavMenu />
          {children}
          <Footer />
          <Toaster richColors />
        </Wrapper>
      </body>
    </html>
  );
}
