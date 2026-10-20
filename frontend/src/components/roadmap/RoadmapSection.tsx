"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING_SNAPPY, SPRING_SMOOTH, SPRING_BOUNCY } from "@/lib/motion-config";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-primitives";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  GraduationCap,
  Layers,
  Sparkles,
  Trophy,
} from "lucide-react";

export interface LessonItem {
  id: string;
  title: string;
  type: "THEORY" | "CODING" | "JUPYTER_PROJECT" | string;
  is_completed?: boolean;
}

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  level?: string;
  estimated_hours?: number;
  track?: "kurikulum_awal" | "ioai" | "cs50p" | string;
  lessons: LessonItem[];
}

export interface SectorConfig {
  id: "track_1" | "track_2" | "track_3" | "track_4";
  sectorNumber: 1 | 2 | 3 | 4;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  moduleRangeText: string;
  accentBorder: string;
  accentText: string;
  accentBg: string;
  badgeBg: string;
  icon: typeof BookOpen;
}

export const SECTOR_CONFIGS: SectorConfig[] = [
  {
    id: "track_1",
    sectorNumber: 1,
    badge: "TRACK 1",
    title: "Sintaksis Python & Model Memori",
    subtitle: "Fondasi Pemrograman & Struktur Data untuk Matematikawan",
    description:
      "Model memori objek Python, pointer & referensi, analisis kompleksitas Big-O, pemecahan masalah algoritma, dan problem set CS50P terpadu.",
    moduleRangeText: "Track 1 (Fondasi Sintaks & Memori)",
    accentBorder: "border-blue-500/40",
    accentText: "text-blue-400",
    accentBg: "bg-blue-500/10",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    icon: BookOpen,
  },
  {
    id: "track_2",
    sectorNumber: 2,
    badge: "TRACK 2",
    title: "Aljabar Linear Numerik & Data Science",
    subtitle: "Vektorisasi NumPy, Pandas & Analisis Data Eksploratif",
    description:
      "Operasi vektor, penyiaran (broadcasting), perkalian matriks, faktorisasi SVD & nilai eigen, pembersihan dataset Pandas, dan feature engineering.",
    moduleRangeText: "Track 2 (Aljabar Linear & EDA)",
    accentBorder: "border-cyan-500/40",
    accentText: "text-cyan-400",
    accentBg: "bg-cyan-500/10",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    icon: Layers,
  },
  {
    id: "track_3",
    sectorNumber: 3,
    badge: "TRACK 3",
    title: "Teori Optimasi & Machine Learning Klasik",
    subtitle: "Fungsi Rugi, Gradient Descent & Model Prediktif",
    description:
      "Penurunan fungsi rugi (loss functions), convex optimization, regresi linear & logistik, Support Vector Machines (SVM), reduksi dimensi PCA, dan metrik kompetisi Kaggle.",
    moduleRangeText: "Track 3 (Optimasi & ML Klasik)",
    accentBorder: "border-amber-500/40",
    accentText: "text-amber-400",
    accentBg: "bg-amber-500/10",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    icon: Sparkles,
  },
  {
    id: "track_4",
    sectorNumber: 4,
    badge: "TRACK 4",
    title: "Deep Learning & Ekshibisi AI (EKKA OSN)",
    subtitle: "PyTorch Autograd, Jaringan Saraf Tiruan & Olimpiade AI",
    description:
      "Kalkulus multivariabel terapan, aturan rantai backpropagation, arsitektur Convolutional Neural Networks (CNN), Transformer NLP, dan tantangan olimpiade nasional.",
    moduleRangeText: "Track 4 (Deep Learning & OSN)",
    accentBorder: "border-purple-500/40",
    accentText: "text-purple-400",
    accentBg: "bg-purple-500/10",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    icon: Trophy,
  },
];

interface RoadmapSectionProps {
  curriculum: ModuleItem[];
  defaultSector?: "all" | "track_1" | "track_2" | "track_3" | "track_4";
  compactHeader?: boolean;
}

export const RoadmapSection: React.FC<RoadmapSectionProps> = ({
  curriculum,
  defaultSector = "all",
  compactHeader = false,
}) => {
  const [activeSector, setActiveSector] = useState<"all" | "track_1" | "track_2" | "track_3" | "track_4">(defaultSector);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Helper to categorize module by track or fallback index
  const getModuleSectorId = (mod: any, index: number): "track_1" | "track_2" | "track_3" | "track_4" => {
    const tid = mod.track_id || mod.track;
    if (tid === "track_1" || tid === "track_01_syntax_memory" || mod.id?.includes("python") || mod.id?.includes("cs50p")) {
      return "track_1";
    }
    if (tid === "track_2" || tid === "track_02_linear_algebra" || mod.id?.includes("data_science") || mod.id?.includes("numpy") || mod.id?.includes("pandas") || mod.id?.includes("math")) {
      return "track_2";
    }
    if (tid === "track_3" || tid === "track_03_optimization_ml" || mod.id?.includes("machine_learning") || mod.id?.includes("ml")) {
      return "track_3";
    }
    if (tid === "track_4" || tid === "track_04_deep_learning" || mod.id?.includes("deep_learning") || mod.id?.includes("dl") || mod.id?.includes("ioai")) {
      return "track_4";
    }
    return "track_2";
  };

  // Pre-calculate statistics per sector
  const sectorStats = SECTOR_CONFIGS.map((sector) => {
    const modules = curriculum.filter((m, idx) => getModuleSectorId(m, idx) === sector.id);
    const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    const completedLessons = modules.reduce(
      (acc, m) => acc + (m.lessons?.filter((l) => l.is_completed)?.length || 0),
      0
    );
    const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const firstIncompleteLesson =
      modules
        .flatMap((m) => m.lessons || [])
        .find((l) => !l.is_completed) || modules[0]?.lessons?.[0];

    return {
      ...sector,
      modules,
      totalLessons,
      completedLessons,
      percent,
      firstIncompleteLesson,
    };
  });

  const totalAllLessons = curriculum.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const totalCompletedLessons = curriculum.reduce(
    (acc, m) => acc + (m.lessons?.filter((l) => l.is_completed)?.length || 0),
    0
  );
  const overallPercent = totalAllLessons > 0 ? Math.round((totalCompletedLessons / totalAllLessons) * 100) : 0;

  const sectorsToDisplay =
    activeSector === "all"
      ? sectorStats
      : sectorStats.filter((s) => s.id === activeSector);

  return (
    <div className="space-y-5 w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-primary-muted text-primary border border-primary/30 rounded text-meta font-mono font-semibold">
              4 TRACK LINEAR EKKA OSN
            </span>
            <span className="text-meta text-slate-400 font-mono">
              {curriculum.length} Modul | {totalAllLessons} Materi
            </span>
          </div>
          <h2 className="text-section-header text-slate-100 font-semibold flex items-center space-x-2">
            <Layers className="w-4 h-4 text-primary" />
            <span>Roadmap Pembelajaran Mandiri</span>
          </h2>
          <p className="text-body text-slate-400 text-xs md:text-sm max-w-2xl">
            Kurikulum bertahap yang dibagi ke dalam 3 sektor: Fondasi Kurikulum Awal, Silabus Pelatnas IOAI Indonesia, dan Harvard CS50P.
          </p>
        </div>

        {/* Global Progress Pill */}
        <div className="flex items-center space-x-3 bg-surface p-2.5 rounded border border-border-def shrink-0 self-start md:self-auto">
          <div className="text-center px-1">
            <span className="text-meta text-slate-400 font-mono block">TOTAL SELESAI</span>
            <span className="text-section-header font-mono font-bold text-slate-100">
              {totalCompletedLessons}/{totalAllLessons}
            </span>
          </div>
          <div className="w-px h-6 bg-border-def" />
          <div className="text-center px-1">
            <span className="text-meta text-slate-400 font-mono block">PROGRESS</span>
            <span className="text-section-header font-mono font-bold text-primary">
              {overallPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Sector Filter Tabs with Shared Sliding Pill */}
      <div className="flex items-center gap-1.5 p-1 bg-surface border border-border-def rounded overflow-x-auto select-none relative">
        <button
          type="button"
          onClick={() => setActiveSector("all")}
          className={`relative flex items-center space-x-2 px-3 py-1.5 rounded text-label font-medium transition-colors shrink-0 z-10 ${
            activeSector === "all"
              ? "text-slate-100 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeSector === "all" && (
            <motion.div
              layoutId="roadmap-sector-pill"
              className="absolute inset-0 bg-elevated border border-slate-600 rounded shadow-sm -z-10"
              transition={SPRING_SNAPPY}
            />
          )}
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span>Semua Sektor ({sectorStats.length})</span>
          <span className="text-meta font-mono px-1.5 py-0.2 bg-root border border-border-def rounded text-slate-400">
            {totalCompletedLessons}/{totalAllLessons}
          </span>
        </button>

        {sectorStats.map((sector) => {
          const Icon = sector.icon;
          const isActive = activeSector === sector.id;

          return (
            <button
              key={sector.id}
              type="button"
              onClick={() => setActiveSector(sector.id)}
              className={`relative flex items-center space-x-2 px-3 py-1.5 rounded text-label font-medium transition-colors shrink-0 z-10 ${
                isActive
                  ? `${sector.accentText} font-semibold`
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="roadmap-sector-pill"
                  className={`absolute inset-0 ${sector.accentBg} border ${sector.accentBorder} rounded shadow-sm -z-10`}
                  transition={SPRING_SNAPPY}
                />
              )}
              <Icon className="w-3.5 h-3.5" />
              <span>{sector.title}</span>
              <span className={`text-meta font-mono px-1.5 py-0.2 rounded border ${
                isActive ? sector.badgeBg : "bg-root border-border-def text-slate-400"
              }`}>
                {sector.completedLessons}/{sector.totalLessons}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sectors Display */}
      <div className="space-y-6">
        {sectorsToDisplay.map((sector) => {
          const Icon = sector.icon;
          const firstIncompleteId = sector.firstIncompleteLesson?.id || "";

          return (
            <div
              key={sector.id}
              className="bg-surface border border-border-def rounded p-5 space-y-4"
            >
              {/* Sector Header Card */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border-def">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-meta font-mono font-bold border ${sector.badgeBg}`}>
                      {sector.badge}
                    </span>
                    <span className="text-meta text-slate-400 font-mono">
                      {sector.moduleRangeText}
                    </span>
                  </div>

                  <h3 className="text-section-header text-slate-100 font-bold flex items-center space-x-2 text-base">
                    <Icon className={`w-4 h-4 ${sector.accentText}`} />
                    <span>{sector.title}</span>
                    <span className="text-slate-500 font-normal text-xs">({sector.subtitle})</span>
                  </h3>

                  <p className="text-body text-slate-300 text-xs md:text-sm leading-relaxed">
                    {sector.description}
                  </p>
                </div>

                {/* Sector Progress & Quick Continue */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <div className="bg-elevated p-2.5 rounded border border-border-def text-center sm:text-right min-w-[150px]">
                    <div className="flex items-center justify-between sm:justify-end sm:space-x-2 text-meta text-slate-400 font-mono">
                      <span>Progres Sektor:</span>
                      <span className={`font-bold ${sector.accentText}`}>{sector.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-root rounded-full overflow-hidden border border-border-def mt-1.5">
                      <div
                        className={`h-full bg-primary`}
                        style={{ width: `${sector.percent}%` }}
                      />
                    </div>
                    <span className="text-meta text-slate-500 font-mono block mt-1 text-center sm:text-right">
                      {sector.completedLessons}/{sector.totalLessons} Pelajaran Selesai
                    </span>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={SPRING_SNAPPY}
                  >
                    <Link
                      href={`/learn?lesson=${firstIncompleteId}`}
                      className="flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded text-label font-medium transition-colors shrink-0"
                    >
                      <span>
                        {sector.completedLessons === sector.totalLessons && sector.totalLessons > 0
                          ? "Tinjau Sektor"
                          : "Masuk Sektor Ini"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </motion.div>
                </div>
              </div>

              {/* Modules Grid inside Sector with StaggerCascade */}
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sector.modules.map((mod, modIdx) => {
                  const mTotal = mod.lessons?.length || 0;
                  const mCompleted = mod.lessons?.filter((l) => l.is_completed)?.length || 0;
                  const mPercent = mTotal > 0 ? Math.round((mCompleted / mTotal) * 100) : 0;
                  const firstLesson = mod.lessons?.[0]?.id || "";
                  const firstIncomplete = mod.lessons?.find((l) => !l.is_completed)?.id || firstLesson;
                  const isExpanded = !!expandedModules[mod.id];

                  // Global index calculation
                  const globalIdx = curriculum.findIndex((m) => m.id === mod.id);
                  const displayModNumber = globalIdx !== -1 ? globalIdx + 1 : modIdx + 1;

                  return (
                    <StaggerItem key={mod.id}>
                      <motion.div
                        whileHover={{ y: -3 }}
                        transition={SPRING_SNAPPY}
                        className="h-full p-4 bg-elevated border border-border-def rounded hover:border-slate-500 transition-colors flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          {/* Module sequence & level */}
                          <div className="flex items-center justify-between text-meta">
                            <span className="font-mono text-primary px-1.5 py-0.5 bg-primary-muted rounded border border-primary/20 font-medium">
                              MODUL {displayModNumber}
                            </span>
                            <div className="flex items-center space-x-2">
                              {mod.level && (
                                <span className="text-slate-400 font-mono px-1 py-0.2 bg-root border border-border-def rounded">
                                  {mod.level}
                                </span>
                              )}
                              <span className="text-slate-400 font-mono">
                                {mCompleted}/{mTotal}
                              </span>
                            </div>
                          </div>

                          {/* Title & Description */}
                          <h4 className="text-section-header text-slate-100 font-semibold line-clamp-1">
                            {mod.title.replace(/Modul \d+:\s*/, "")}
                          </h4>

                          <p className="text-body text-slate-400 text-xs line-clamp-2 leading-relaxed">
                            {mod.description}
                          </p>
                        </div>

                        {/* Module Lessons Preview */}
                        {mod.lessons && mod.lessons.length > 0 && (
                          <div className="pt-2 border-t border-border-def/60 space-y-1.5">
                            <div className="flex items-center justify-between text-meta text-slate-400">
                              <span className="font-mono">Materi ({mTotal}):</span>
                              <button
                                type="button"
                                onClick={() => toggleModuleExpanded(mod.id)}
                                className="text-primary hover:text-primary-hover flex items-center space-x-1 transition-colors cursor-pointer"
                              >
                                <span>{isExpanded ? "Ringkas" : "Rincian"}</span>
                                <motion.div
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  transition={SPRING_SNAPPY}
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </motion.div>
                              </button>
                            </div>

                            {/* List of lessons */}
                            <div className={`space-y-1 text-xs ${isExpanded ? "max-h-60 overflow-y-auto pr-1" : ""}`}>
                              {(isExpanded ? mod.lessons : mod.lessons.slice(0, 2)).map((les) => (
                                <Link
                                  key={les.id}
                                  href={`/learn?lesson=${les.id}`}
                                  className="flex items-center justify-between p-1.5 bg-surface hover:bg-root rounded border border-border-def/70 transition-colors group"
                                >
                                  <div className="flex items-center space-x-2 truncate">
                                    {les.is_completed ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    ) : les.type === "CODING" ? (
                                      <Code2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                    ) : (
                                      <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    )}
                                    <span className="text-slate-300 group-hover:text-primary truncate text-xs">
                                      {les.title}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono px-1 py-0.2 bg-elevated rounded border border-border-def text-slate-400 shrink-0 ml-1">
                                    {les.type === "CODING" ? "Kode" : "Teori"}
                                  </span>
                                </Link>
                              ))}
                              {!isExpanded && mod.lessons.length > 2 && (
                                <div
                                  onClick={() => toggleModuleExpanded(mod.id)}
                                  className="text-[11px] text-slate-500 font-mono text-center cursor-pointer hover:text-slate-300 py-0.5"
                                >
                                  + {mod.lessons.length - 2} materi lainnya...
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Progress bar & action */}
                        <div className="space-y-2 pt-2 border-t border-border-def">
                          <div className="w-full h-1.5 bg-root rounded-full overflow-hidden border border-border-def">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${mPercent}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-meta">
                            <span className="text-slate-500 font-mono">{mPercent}% Tuntas</span>
                            <Link
                              href={`/learn?lesson=${firstIncomplete}`}
                              className="text-primary hover:text-primary-hover font-medium flex items-center space-x-1"
                            >
                              <span>Masuk Modul</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
};
