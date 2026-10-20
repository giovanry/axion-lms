"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SideNavbar } from "@/components/layout/SideNavbar";
import { AIAssistantPanel } from "@/components/ai/AIAssistantPanel";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return (
      <div className="min-h-screen w-full bg-root text-slate-100 flex flex-col overflow-x-hidden selection:bg-primary/30 selection:text-white">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-row w-full h-screen overflow-hidden selection:bg-primary/30 selection:text-white">
      <SideNavbar />
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {children}
      </main>
      <AIAssistantPanel />
    </div>
  );
};
