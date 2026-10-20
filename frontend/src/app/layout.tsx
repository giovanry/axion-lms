import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SideNavbar } from "@/components/layout/SideNavbar";
import { AIAssistantPanel } from "@/components/ai/AIAssistantPanel";
import { DesktopApiBridge } from "@/components/common/DesktopApiBridge";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Axion LMS | Platform Belajar Python, Matematika AI, dan Data Science",
  description: "Platform pembelajaran mandiri berbasis lokal untuk persiapan Olimpiade Sains Nasional Kecerdasan Artifisial, komputasi matriks, dan competitive programming.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen bg-root text-slate-100`}>
        <DesktopApiBridge />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
