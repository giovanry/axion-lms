"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Code2, Compass, Database, Download, Flame, Home, Layers, MessageSquareCode, Settings, Trophy } from "lucide-react";
import { useLmsStore } from "@/stores/useLmsStore";
import { AccountSettingsModal } from "@/components/settings/AccountSettingsModal";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { motion } from "framer-motion";
import { SPRING_SNAPPY } from "@/lib/motion-config";

export const TopNavbar: React.FC = () => {
  const pathname = usePathname();
  const { userStats, activeLesson, toggleAiDrawer, isAiDrawerOpen } = useLmsStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const handleExportBackup = async () => {
    try {
      const res = await fetch("/api/v1/export/backup");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `axion_backup_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert("Failed to export backup. Verify backend is active.");
    }
  };

  const navLinks = [
    { href: "/", label: "Beranda", icon: Home, exact: true },
    { href: "/roadmap", label: "Roadmap", icon: Layers },
    { href: "/learn", label: "Belajar", icon: BookOpen },
    { href: "/playground", label: "Playground", icon: Code2 },
    { href: "/datasets", label: "Datasets", icon: Database },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <header className="h-[44px] bg-surface border-b border-border-def flex items-center justify-between px-4 select-none sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2 text-page-title text-slate-100 hover:text-primary transition-colors">
          <span className="font-semibold tracking-tight">AXION</span>
          <span className="text-meta text-primary font-mono px-1 py-0.5 border border-primary/30 rounded-sm">LMS</span>
        </Link>

        <span className="text-slate-600 text-meta">/</span>

        {/* Breadcrumb Context */}
        <div className="hidden lg:flex items-center space-x-1 text-label text-slate-400">
          <span>{activeLesson?.module_title || "Modul"}</span>
          <span>&gt;</span>
          <span className="text-slate-200 truncate max-w-[200px]">{activeLesson?.title || "Latihan"}</span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex items-center space-x-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <motion.div
              key={link.href}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={SPRING_SNAPPY}
              className="relative"
            >
              {isActive && (
                <motion.div
                  layoutId="top-nav-active-pill"
                  className="absolute inset-0 bg-primary/20 rounded border border-primary/30 -z-0"
                  transition={SPRING_SNAPPY}
                />
              )}
              <Link
                href={link.href}
                className={`relative z-10 flex items-center space-x-1 px-3 py-1 rounded text-label transition-colors ${
                  isActive
                    ? "text-primary font-medium"
                    : "text-slate-400 hover:text-slate-200 hover:bg-elevated"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Right Controls: Streak, Backup, AI Tutor */}
      <div className="flex items-center space-x-2">
        {/* Streak Counter */}
        <div
          title="Daily Streak: hari aktif berturut-turut"
          className="flex items-center space-x-1 px-2 py-1 bg-elevated border border-border-def rounded text-label text-amber-400"
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-mono font-medium">{userStats?.daily_streak ?? 1}</span>
          <span className="text-meta text-slate-400 hidden sm:inline">hari</span>
        </div>

        {/* Account Linking Settings */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          title="Tautkan Akun Codeforces & Kaggle"
          aria-label="Pengaturan Akun"
          className="p-1.5 bg-elevated hover:bg-surface border border-border-def rounded text-slate-300 hover:text-primary transition-colors flex items-center space-x-1"
        >
          <Settings className="w-4 h-4" />
          {userStats?.codeforces_handle && (
            <span className="text-meta font-mono text-primary hidden md:inline">
              @{userStats.codeforces_handle}
            </span>
          )}
        </button>

        {/* Onboarding Tour Button */}
        <button
          onClick={() => setIsOnboardingOpen(true)}
          title="Panduan Onboarding Axion"
          aria-label="Panduan Onboarding"
          className="p-1.5 bg-elevated hover:bg-surface border border-border-def rounded text-slate-300 hover:text-primary transition-colors flex items-center space-x-1"
        >
          <Compass className="w-4 h-4 text-primary" />
          <span className="text-meta font-medium hidden lg:inline">Panduan</span>
        </button>

        {/* 1-Click Backup Export */}
        <button
          onClick={handleExportBackup}
          title="Export Backup ZIP (Notebooks, Notes & DB)"
          aria-label="Export Backup Archive"
          className="p-1.5 bg-elevated hover:bg-surface border border-border-def rounded text-slate-300 hover:text-slate-100 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* AI Tutor Toggle */}
        <button
          onClick={() => toggleAiDrawer()}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded border text-label transition-colors ${
            isAiDrawerOpen
              ? "bg-primary text-white border-primary"
              : "bg-elevated hover:bg-surface text-slate-300 border-border-def"
          }`}
          aria-label="Toggle AI Tutor Panel"
        >
          <MessageSquareCode className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Tutor</span>
        </button>
      </div>

      {/* Account Settings Modal */}
      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </header>
  );
};
