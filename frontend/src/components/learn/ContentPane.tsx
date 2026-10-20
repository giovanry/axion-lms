"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING_SNAPPY, SPRING_SMOOTH, SPRING_BOUNCY, EASE_OUT_EXPO } from "@/lib/motion-config";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  BookOpen,
  Bot,
  Code2,
  HelpCircle,
  Sparkles,
  X,
} from "lucide-react";
import { useLmsStore } from "@/stores/useLmsStore";

interface ContentPaneProps {
  curriculumTree: any[];
  onSelectLesson: (id: string) => void;
}

export type CourseTrack = "all" | "track_1" | "track_2" | "track_3" | "track_4";

interface TrackMeta {
  id: "track_1" | "track_2" | "track_3" | "track_4";
  label: string;
  badge: string;
  icon: string;
  desc: string;
  color: string;
}

const TRACKS: TrackMeta[] = [
  {
    id: "track_1",
    label: "Track 1: Sintaks & Memori",
    badge: "Fase 1",
    icon: "📘",
    desc: "Fondasi Python, Model Memori Objek, & Problem Sets",
    color: "from-blue-600/20 to-blue-900/10 border-blue-500/30 text-blue-300",
  },
  {
    id: "track_2",
    label: "Track 2: Aljabar Linear & EDA",
    badge: "Fase 2",
    icon: "📐",
    desc: "Vektorisasi NumPy, Pandas & Aljabar Matriks Numerik",
    color: "from-cyan-600/20 to-cyan-900/10 border-cyan-500/30 text-cyan-300",
  },
  {
    id: "track_3",
    label: "Track 3: Optimasi & ML Klasik",
    badge: "Fase 3",
    icon: "⚡",
    desc: "Optimasi Fungsi Rugi, Regresi, SVM & Evaluasi Model",
    color: "from-amber-600/20 to-amber-900/10 border-amber-500/30 text-amber-300",
  },
  {
    id: "track_4",
    label: "Track 4: Deep Learning & OSN",
    badge: "Fase 4",
    icon: "🧠",
    desc: "PyTorch Autograd, Jaringan Saraf Tiruan & Ekshibisi AI",
    color: "from-purple-600/20 to-purple-900/10 border-purple-500/30 text-purple-300",
  },
];

const TRACK_CONFIG: Record<string, TrackMeta> = {
  track_1: TRACKS[0],
  track_2: TRACKS[1],
  track_3: TRACKS[2],
  track_4: TRACKS[3],
};

function getModuleTrack(mod: any): "track_1" | "track_2" | "track_3" | "track_4" {
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
}

export const ContentPane: React.FC<ContentPaneProps> = ({ curriculumTree, onSelectLesson }) => {
  const { activeLesson, userStats, setUserStats, toggleAiDrawer, setAiContext } = useLmsStore();
  const [isCompleted, setIsCompleted] = useState<boolean>(activeLesson?.is_completed || false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTrack, setActiveTrack] = useState<"track_1" | "track_2" | "track_3" | "track_4">("track_1");
  const [drawerTrackFilter, setDrawerTrackFilter] = useState<CourseTrack>("all");
  const [isPullingTranscript, setIsPullingTranscript] = useState(false);
  const [transcriptStatus, setTranscriptStatus] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(90);

  useEffect(() => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
  }, [activeLesson?.id]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setHeaderHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setIsCompleted(activeLesson?.is_completed || false);
  }, [activeLesson?.id, activeLesson?.is_completed]);

  // Synchronize activeTrack when activeLesson changes
  useEffect(() => {
    if (!activeLesson) return;
    const parentMod = curriculumTree.find(
      (m) => m.id === activeLesson.module_id || m.lessons?.some((l: any) => l.id === activeLesson.id)
    );
    if (parentMod) {
      setActiveTrack(getModuleTrack(parentMod));
    }
  }, [activeLesson?.id, activeLesson?.module_id, curriculumTree]);

  // Click outside to close drawer
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setIsDrawerOpen(false);
      }
    }
    if (isDrawerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDrawerOpen]);

  // Flatten all lessons across modules for chronological pagination
  const allLessons = curriculumTree.flatMap((mod) =>
    (mod.lessons || []).map((les: any) => ({
      ...les,
      moduleId: mod.id,
      moduleTitle: mod.title,
      track: getModuleTrack(mod),
    }))
  );

  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Filter modules by active track for the header selector
  const activeTrackModules = curriculumTree.filter((m) => getModuleTrack(m) === activeTrack);
  const currentModule = activeTrackModules.find((m) =>
    m.id === activeLesson?.module_id || m.lessons?.some((l: any) => l.id === activeLesson?.id)
  ) || activeTrackModules[0] || curriculumTree[0];
  const currentModuleId = currentModule?.id || "";
  const currentModuleLessons = currentModule?.lessons || [];

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/v1/lessons/${activeLesson.id}/complete`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsCompleted(true);
        setUserStats({
          id: 1,
          name: userStats?.name || "Axion Scholar",
          daily_streak: data.daily_streak,
          last_active_date: new Date().toISOString().slice(0, 10),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSelectTrack = (trackId: "track_1" | "track_2" | "track_3" | "track_4") => {
    setActiveTrack(trackId);
    const firstMod = curriculumTree.find((m) => getModuleTrack(m) === trackId);
    if (firstMod && firstMod.lessons && firstMod.lessons.length > 0) {
      onSelectLesson(firstMod.lessons[0].id);
    }
  };

  return (
    <div className="relative h-full flex flex-col bg-surface overflow-hidden border-r border-border-def">
      {/* Header Bar */}
      <div ref={headerRef} className="p-2.5 bg-elevated border-b border-border-def flex flex-col gap-2 shrink-0">
        {/* Row 1: Drawer Toggle, 4 Track Switchers, Prev/Next, and Mark Complete */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={SPRING_SNAPPY}
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-label font-medium transition-colors border ${
                isDrawerOpen
                  ? "bg-primary text-white border-primary"
                  : "bg-surface hover:bg-elevated text-slate-300 border-border-def hover:text-white"
              }`}
              title="Buka Daftar Modul & Pelajaran"
            >
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Kurikulum ({curriculumTree.length})</span>
              <span className="sm:hidden">Menu</span>
              <motion.div
                animate={{ rotate: isDrawerOpen ? 180 : 0 }}
                transition={SPRING_SNAPPY}
              >
                <ChevronDown className="w-3 h-3" />
              </motion.div>
            </motion.button>

            {/* 4-Track Segmented Buttons with Shared Sliding Pill */}
            <div className="flex items-center bg-surface p-0.5 rounded border border-border-def text-xs relative">
              {TRACKS.map((t) => {
                const isSelected = activeTrack === t.id;
                const count = curriculumTree.filter((m) => getModuleTrack(m) === t.id).length;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTrack(t.id)}
                    className={`relative px-2 py-1 rounded font-medium transition-colors flex items-center gap-1 cursor-pointer z-10 ${
                      isSelected
                        ? "text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                    title={t.desc}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="learn-active-track-pill"
                        className="absolute inset-0 bg-primary rounded shadow-sm -z-10"
                        transition={SPRING_SNAPPY}
                      />
                    )}
                    <span>{t.icon}</span>
                    <span className="hidden md:inline">{t.label}</span>
                    <span className="md:hidden">{t.badge}</span>
                    <span className="text-[10px] opacity-75 font-mono ml-0.5">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ml-auto flex items-center space-x-2 shrink-0">
            {/* Quick Prev / Next Buttons in Header */}
            <div className="flex items-center bg-surface rounded border border-border-def p-0.5">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={SPRING_SNAPPY}
                onClick={() => prevLesson && onSelectLesson(prevLesson.id)}
                disabled={!prevLesson}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title={prevLesson ? `Sebelumnya: ${prevLesson.title}` : "Pelajaran Pertama"}
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <span className="text-meta font-mono text-slate-400 px-1.5">
                {currentIndex >= 0 ? `${currentIndex + 1}/${allLessons.length}` : "-"}
              </span>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={SPRING_SNAPPY}
                onClick={() => nextLesson && onSelectLesson(nextLesson.id)}
                disabled={!nextLesson}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title={nextLesson ? `Selanjutnya: ${nextLesson.title}` : "Pelajaran Terakhir"}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>

            <motion.button
              whileHover={!isCompleted ? { scale: 1.02, y: -1 } : undefined}
              whileTap={!isCompleted ? { scale: 0.96 } : undefined}
              transition={SPRING_SNAPPY}
              onClick={handleMarkComplete}
              disabled={isCompleted || isCompleting}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-label font-medium transition-colors ${
                isCompleted
                  ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 cursor-default"
                  : "bg-primary hover:bg-primary-hover text-white cursor-pointer"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isCompleted ? "Selesai" : isCompleting ? "Menyimpan..." : "Tandai Selesai"}</span>
            </motion.button>
          </div>
        </div>

        {/* Row 2: Filtered Module & Lesson Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 min-w-0">
          {/* Direct Module Dropdown (Filtered to Selected Track) */}
          <select
            value={currentModuleId}
            onChange={(e) => {
              const targetMod = curriculumTree.find((m) => m.id === e.target.value);
              if (targetMod && targetMod.lessons && targetMod.lessons.length > 0) {
                onSelectLesson(targetMod.lessons[0].id);
              }
            }}
            className="bg-surface hover:bg-elevated border border-border-def text-slate-100 text-xs font-semibold rounded px-2.5 py-1.5 focus:outline-none focus:border-primary cursor-pointer w-full min-w-0 truncate"
            title={`Pilih modul dalam jalur ${TRACK_CONFIG[activeTrack]?.label || ""}`}
          >
            {activeTrackModules.map((mod) => (
              <option key={mod.id} value={mod.id} className="bg-surface text-slate-100 py-1">
                {mod.title}
              </option>
            ))}
          </select>

          {/* Direct Lesson Dropdown for Active Module */}
          <select
            value={activeLesson?.id || ""}
            onChange={(e) => onSelectLesson(e.target.value)}
            className="bg-surface hover:bg-elevated border border-border-def text-slate-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-primary cursor-pointer w-full min-w-0 truncate"
            title="Pilih materi dalam modul aktif"
          >
            {currentModuleLessons.map((les: any) => (
              <option key={les.id} value={les.id} className="bg-surface text-slate-200 py-1">
                {les.is_completed ? "✓ " : ""}{les.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Slide-out Module Drawer / Curriculum Explorer Popover */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            ref={drawerRef}
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            transition={SPRING_SNAPPY}
            style={{ top: headerHeight }}
            className="absolute left-0 bottom-0 w-full sm:w-[440px] bg-elevated/95 backdrop-blur-md border-r border-border-def z-30 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-3 bg-surface border-b border-border-def flex items-center justify-between">
              <div>
                <span className="text-meta text-primary font-mono block">NAVIGASI KURIKULUM AXION</span>
                <span className="text-body font-semibold text-slate-200">
                  {curriculumTree.length} Modul &bull; {allLessons.length} Pelajaran
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={SPRING_SNAPPY}
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded"
                title="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Track Filter Pills in Drawer with Shared Sliding Pill */}
            <div className="px-3 py-2 bg-root/70 border-b border-border-def flex items-center gap-1.5 overflow-x-auto relative">
              <button
                onClick={() => setDrawerTrackFilter("all")}
                className={`relative px-2 py-1 rounded text-xs font-mono transition-colors shrink-0 z-10 ${
                  drawerTrackFilter === "all"
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {drawerTrackFilter === "all" && (
                  <motion.div
                    layoutId="drawer-filter-pill"
                    className="absolute inset-0 bg-primary rounded -z-10 shadow-sm"
                    transition={SPRING_SNAPPY}
                  />
                )}
                Semua ({curriculumTree.length})
              </button>
              {TRACKS.map((t) => {
                const isSelected = drawerTrackFilter === t.id;
                const count = curriculumTree.filter((m) => getModuleTrack(m) === t.id).length;
                return (
                  <button
                    key={t.id}
                    onClick={() => setDrawerTrackFilter(t.id)}
                    className={`relative px-2 py-1 rounded text-xs font-mono transition-colors shrink-0 flex items-center gap-1 z-10 ${
                      isSelected
                        ? "text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="drawer-filter-pill"
                        className="absolute inset-0 bg-primary rounded -z-10 shadow-sm"
                        transition={SPRING_SNAPPY}
                      />
                    )}
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                    <span className="opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>

          {/* Drawer Grouped Module List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-5">
            {TRACKS.filter((t) => drawerTrackFilter === "all" || drawerTrackFilter === t.id).map((track) => {
              const modulesInTrack = curriculumTree.filter((m) => getModuleTrack(m) === track.id);
              if (modulesInTrack.length === 0) return null;

              const totalLessonsInTrack = modulesInTrack.reduce(
                (acc, m) => acc + (m.lessons?.length || 0),
                0
              );
              const completedInTrack = modulesInTrack.reduce(
                (acc, m) => acc + (m.lessons?.filter((l: any) => l.is_completed).length || 0),
                0
              );

              return (
                <div key={track.id} className="space-y-2">
                  {/* Category Track Header Banner */}
                  <div className={`p-2 rounded border bg-gradient-to-r flex items-center justify-between ${track.color}`}>
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{track.icon}</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{track.label}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{track.desc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-surface/80 border border-border-def text-slate-300 shrink-0">
                      {completedInTrack}/{totalLessonsInTrack} Selesai
                    </span>
                  </div>

                  {/* Modules within this track */}
                  <div className="space-y-2 pl-0.5">
                    {modulesInTrack.map((mod) => (
                      <div key={mod.id} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (mod.lessons && mod.lessons.length > 0) {
                              onSelectLesson(mod.lessons[0].id);
                              setIsDrawerOpen(false);
                            }
                          }}
                          className="w-full flex items-center justify-between text-meta font-mono text-slate-300 hover:text-primary px-2.5 py-1.5 rounded bg-surface hover:bg-elevated border border-border-def/60 text-left transition-colors cursor-pointer group"
                          title={`Buka ${mod.title}`}
                        >
                          <span className="font-semibold truncate group-hover:text-primary">
                            {mod.title}
                          </span>
                          <span className="text-[10px] bg-elevated px-1.5 py-0.5 rounded border border-border-def shrink-0 ml-1 text-slate-400">
                            {mod.lessons.filter((l: any) => l.is_completed).length}/{mod.lessons.length}
                          </span>
                        </button>

                        <div className="space-y-1 pl-2">
                          {mod.lessons.map((les: any) => {
                            const isActive = activeLesson?.id === les.id;
                            return (
                              <button
                                key={les.id}
                                onClick={() => {
                                  onSelectLesson(les.id);
                                  setIsDrawerOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded text-label flex items-center justify-between transition-colors ${
                                  isActive
                                    ? "bg-primary text-white font-medium shadow-sm"
                                    : "bg-surface/70 hover:bg-elevated text-slate-300 border border-border-def/40"
                                }`}
                              >
                                <div className="flex items-center space-x-2 truncate">
                                  {les.is_completed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                                  )}
                                  <span className="truncate">{les.title}</span>
                                </div>
                                <span className="text-[10px] font-mono opacity-70 ml-2 shrink-0">
                                  {les.type === "CODING" ? "KODE" : "TEORI"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Scrollable Content with Fade In Out Transitions */}
      <div ref={contentScrollRef} className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLesson?.id || "empty"}
            initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
            transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
            className="space-y-4"
          >
            {/* Embedded Video Player if present */}
            {activeLesson?.video_url && (
          <div className="w-full aspect-video rounded overflow-hidden border border-border-def bg-root">
            <iframe
              src={activeLesson.video_url}
              title={activeLesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}
        {activeLesson?.video_url && (
          <div className="flex items-center justify-between text-meta bg-surface p-2 rounded border border-border-def -mt-2">
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={SPRING_SNAPPY}
                onClick={async () => {
                  if (!activeLesson?.video_url) return;
                  setIsPullingTranscript(true);
                  setTranscriptStatus(null);
                  try {
                    const res = await fetch("/api/v1/ai/youtube-transcript", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ video_url: activeLesson.video_url }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setTranscriptStatus(`✓ ${data.total_segments || 0} segmen`);
                      setAiContext({
                        title: activeLesson.title,
                        transcriptContext: data.full_text || "",
                      });
                    } else {
                      setTranscriptStatus("Transkrip tidak ada");
                    }
                  } catch {
                    setTranscriptStatus("Gagal menarik");
                  } finally {
                    setIsPullingTranscript(false);
                  }
                }}
                disabled={isPullingTranscript}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-elevated hover:bg-root border border-border-def text-primary hover:text-primary-hover font-mono transition-colors disabled:opacity-50"
                title="Tarik transkrip video ini dan suntikkan ke AI Tutor"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isPullingTranscript ? "Menarik..." : "Tarik Transkrip ke AI"}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={SPRING_SNAPPY}
                onClick={() => {
                  toggleAiDrawer(true);
                  setAiContext({
                    title: activeLesson?.title || "Video Pembelajaran",
                    code: activeLesson?.starter_code || "",
                  });
                }}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-elevated hover:bg-root border border-border-def text-slate-300 hover:text-white transition-colors font-mono"
                title="Buka AI Floating Bubble untuk bertanya seputar video ini"
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tanya Momen Ini</span>
              </motion.button>
            </div>

            <div className="flex items-center space-x-2">
              {transcriptStatus && (
                <span className="text-[11px] font-mono text-emerald-400">
                  {transcriptStatus}
                </span>
              )}
              <a
                href={activeLesson.video_url.replace("/embed/", "/watch?v=")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-meta font-mono text-slate-400 hover:text-primary"
              >
                Buka di YouTube ↗
              </a>
            </div>
          </div>
        )}

        {/* Markdown & LaTeX Content Viewer */}
        <article className="prose prose-invert max-w-none text-body text-slate-300">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-page-title text-slate-100 font-semibold mb-3 border-b border-border-def pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-section-header text-slate-200 font-semibold mt-4 mb-2">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-body font-semibold text-slate-300 mt-3 mb-1">
                  {children}
                </h3>
              ),
              p: ({ children }) => <p className="text-body text-slate-300 mb-3">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 mb-3 text-body space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 text-body space-y-1">{children}</ol>,
              code: ({ children, className }) => {
                const isBlock = className?.includes("language-");
                if (isBlock) {
                  return (
                    <div className="my-3 p-3 bg-root border border-border-def rounded font-mono text-label overflow-x-auto text-sky-300">
                      <code>{children}</code>
                    </div>
                  );
                }
                return (
                  <code className="px-1.5 py-0.5 bg-elevated border border-border-def rounded text-label font-mono text-primary">
                    {children}
                  </code>
                );
              },
            }}
          >
            {activeLesson?.markdown_content || "Memuat materi pelajaran..."}
          </ReactMarkdown>
            </article>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Lesson Navigation Footer */}
      <div className="p-2.5 bg-elevated border-t border-border-def flex items-center justify-between text-label text-slate-400 shrink-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={SPRING_SNAPPY}
          onClick={() => prevLesson && onSelectLesson(prevLesson.id)}
          disabled={!prevLesson}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-surface hover:bg-elevated border border-border-def text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </motion.button>

        {/* Scrollable Dots / Mini Badge Navigation */}
        <div className="flex-1 overflow-x-auto mx-2 flex items-center justify-center space-x-1 py-0.5 scrollbar-thin">
          {allLessons.map((les: any, idx: number) => {
            const isActive = activeLesson?.id === les.id;
            return (
              <motion.button
                key={les.id}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.92 }}
                transition={SPRING_SNAPPY}
                onClick={() => onSelectLesson(les.id)}
                className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] border transition-colors shrink-0 ${
                  isActive
                    ? "bg-primary text-white border-primary"
                    : les.is_completed
                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/40"
                    : "bg-surface hover:bg-elevated text-slate-400 border-border-def"
                }`}
                title={`${idx + 1}. ${les.title}`}
              >
                {idx + 1}
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={SPRING_SNAPPY}
          onClick={() => nextLesson && onSelectLesson(nextLesson.id)}
          disabled={!nextLesson}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-surface hover:bg-elevated border border-border-def text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </div>
  );
};
