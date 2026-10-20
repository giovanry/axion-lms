"use client";

import React from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Database,
  PlusCircle,
  PlayCircle,
  ShieldCheck,
  Cpu,
  BrainCircuit,
  PanelRightClose,
  PanelRightOpen,
  User,
  Flame,
} from "lucide-react";
import { useAxionStore } from "@/stores/useAxionStore";

export const TopCommandHeader: React.FC = () => {
  const {
    isSidebarOpen,
    toggleSidebar,
    isAiPanelOpen,
    toggleAiPanel,
    activeLesson,
    nextBestLesson,
    resumeNextLesson,
    aiStatus,
    setVaultOpen,
    setSmartDropzoneOpen,
    setKaggleHubOpen,
    userProfile,
  } = useAxionStore();

  return (
    <header className="h-12 border-b border-zinc-800/80 bg-zinc-950 px-3 flex items-center justify-between shrink-0 select-none z-30">
      {/* Left: Branding, Sidebar Toggle, & Breadcrumb */}
      <div className="flex items-center space-x-2.5 min-w-0">
        <button
          onClick={() => toggleSidebar()}
          title="Toggle Sidebar (Cmd+B / Ctrl+B)"
          className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* Brand & Version Badge */}
        <div className="flex items-center space-x-1.5 font-mono">
          <span className="font-bold tracking-wider text-zinc-100 text-[14px]">AXION</span>
          <span className="text-[10px] px-1.5 py-0.2 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded font-medium">
            v2.0 EKKA-OSN
          </span>
        </div>

        <div className="hidden md:block h-3.5 w-px bg-zinc-800" />

        {/* Breadcrumb Navigation */}
        <div className="hidden lg:flex items-center space-x-1.5 text-[12px] text-zinc-400 truncate max-w-sm xl:max-w-md">
          <span className="text-zinc-500 truncate">
            {activeLesson?.track_title || "Track 2: Aljabar Linear Numerik"}
          </span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-200 font-medium truncate">
            {activeLesson?.title || "2.1 Perkalian Matriks NumPy & Broadcasting"}
          </span>
        </div>
      </div>

      {/* Center: Guided HUD Action Button & Dropzone Triggers */}
      <div className="flex items-center space-x-2">
        {/* Next Best Action Button (Solusi Mulai Belajar) */}
        <button
          onClick={resumeNextLesson}
          title="Lanjutkan Belajar Modul Berikutnya (Shift+Space)"
          className="flex items-center space-x-2 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-medium shadow-sm transition-all group"
        >
          <PlayCircle className="w-3.5 h-3.5 text-indigo-200 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Lanjutkan Belajar:</span>
          <span className="font-mono text-indigo-100 truncate max-w-[140px] md:max-w-[200px]">
            {nextBestLesson?.title.split(" ")[1] || "Matriks NumPy"}
          </span>
          <kbd className="hidden xl:inline-block text-[10px] bg-indigo-700/80 px-1 py-0.2 rounded font-mono text-indigo-200">
            Shift+Space
          </kbd>
        </button>

        {/* Smart Dropzone Trigger */}
        <button
          onClick={() => setSmartDropzoneOpen(true)}
          title="Import & Generate Kurikulum AI dari PDF / Catatan"
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-zinc-100 border border-zinc-800 text-[12px] font-medium transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">+ Drop & Generate</span>
        </button>

        {/* Kaggle Dataset Hub Trigger */}
        <button
          onClick={() => setKaggleHubOpen(true)}
          title="Jelajahi & Unduh Dataset Kompetisi Kaggle"
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-zinc-100 border border-zinc-800 text-[12px] font-medium transition-colors"
        >
          <Database className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden md:inline">Kaggle Hub</span>
        </button>
      </div>

      {/* Right: AI Status, Streak, Socratic AI Panel Toggle, & Vault Trigger */}
      <div className="flex items-center space-x-2">
        {/* Streak Counter */}
        <div
          title="Daily Streak Belajar"
          className="hidden sm:flex items-center space-x-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] font-mono text-amber-400"
        >
          <Flame className="w-3.5 h-3.5 fill-amber-500/20 text-amber-400" />
          <span>{userProfile.streakDays}d</span>
        </div>

        {/* Gemini AI Status Indicator */}
        <div
          title={
            aiStatus === "ONLINE_GEMINI"
              ? "Gemini 3.6 Flash Aktif & Siap"
              : "Ollama Fallback Aktif (Offline Mode)"
          }
          className="flex items-center space-x-1.5 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] font-mono text-zinc-300"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              aiStatus === "ONLINE_GEMINI"
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                : "bg-amber-500"
            }`}
          />
          <span className="hidden lg:inline text-zinc-400">
            {aiStatus === "ONLINE_GEMINI" ? "Gemini 3.6" : "Ollama"}
          </span>
        </div>

        {/* Socratic AI Panel Toggle */}
        <button
          onClick={() => toggleAiPanel()}
          title="Toggle Socratic AI Panel (Cmd+J / Ctrl+J)"
          className={`p-1.5 rounded border transition-colors ${
            isAiPanelOpen
              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
              : "text-zinc-400 hover:text-zinc-100 bg-zinc-900 border-zinc-800"
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
        </button>

        {/* Axion Vault / User Profile Button */}
        <button
          onClick={() => setVaultOpen(true)}
          title="Buka Axion Vault & Kredensial"
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-[12px] text-zinc-200 transition-colors"
        >
          <div className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-mono text-[10px] font-bold">
            G
          </div>
          <span className="hidden sm:inline font-medium">{userProfile.name}</span>
        </button>
      </div>
    </header>
  );
};
