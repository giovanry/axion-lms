"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  FolderTree,
  FileCode,
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Video,
  Search,
  Database,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useAxionStore, AxionLesson } from "@/stores/useAxionStore";

interface RawModule {
  id: string;
  title: string;
  description?: string;
  track_id?: string;
  track_title?: string;
  lessons: Array<{
    id: string;
    title: string;
    type: "CODING" | "THEORY" | "JUPYTER_PROJECT";
    content_path: string;
    video_url?: string;
    is_completed?: boolean;
    starter_code?: string;
    test_assertions?: string;
  }>;
}

export const Zona1CurriculumExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"CURRICULUM" | "FILES">("CURRICULUM");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>({
    track_1: false,
    track_2: true,
    track_3: false,
    track_4: false,
  });

  const {
    activeLessonId,
    setActiveLessonId,
    setActiveLesson,
    curriculum,
    setCurriculum,
  } = useAxionStore();

  // 1. Fetch live curriculum on mount
  useEffect(() => {
    fetch("/api/v1/curriculum")
      .then((res) => res.json())
      .then((data: RawModule[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setCurriculum(data as any);
        }
      })
      .catch((err) => {
        console.warn("Using local curriculum fallback:", err);
      });
  }, [setCurriculum]);

  // 2. Fetch active lesson detail on ID change
  useEffect(() => {
    if (!activeLessonId) return;

    fetch(`/api/v1/lessons/${activeLessonId}`)
      .then((res) => res.json())
      .then((lessonDetail) => {
        if (lessonDetail) {
          setActiveLesson(lessonDetail);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch remote lesson detail:", err);
      });
  }, [activeLessonId, setActiveLesson]);

  const toggleTrack = (trackKey: string) => {
    setExpandedTracks((prev) => ({ ...prev, [trackKey]: !prev[trackKey] }));
  };

  // Structured Track Definitions with legacy modules mapped
  const tracksMeta = [
    {
      key: "track_1",
      id: "track_1",
      number: "TRACK 1",
      title: "Sintaksis Python & Model Memori",
      subtitle: "CS50P & Fondasi Algoritma",
      description: "Penguasaan dasar bahasa, memori objek, dan rekursi untuk matematikawan.",
    },
    {
      key: "track_2",
      id: "track_2",
      number: "TRACK 2",
      title: "Aljabar Linear & Data Science",
      subtitle: "NumPy Broadcasting & Pandas EDA",
      description: "Komputasi matriks, dekomposisi ruang vektor, dan manipulasi tabel data.",
    },
    {
      key: "track_3",
      id: "track_3",
      number: "TRACK 3",
      title: "Optimasi & Machine Learning Klasik",
      subtitle: "Regresi, SVM, PCA & Metrik Evaluasi",
      description: "Turunan parsial, fungsi kerugian, reduksi dimensi, dan evaluasi matriks konfusi.",
    },
    {
      key: "track_4",
      id: "track_4",
      number: "TRACK 4",
      title: "Deep Learning & Ekshibisi AI",
      subtitle: "PyTorch, CNN, NLP & Transformers",
      description: "Jaringan saraf tiruan, konvolusi citra, atensi, dan persiapan soal EKKA OSN.",
    },
  ];

  // Organize curriculum into the 4 tracks
  const organizedTracks = useMemo(() => {
    return tracksMeta.map((t) => {
      const trackModules = (curriculum || []).filter((m: any) => {
        const mid = m.id || "";
        if (t.id === "track_1") return mid.includes("cs50p") || mid === "module_python_foundations";
        if (t.id === "track_2") return mid === "module_data_science" || mid === "module_ioai_foundations";
        if (t.id === "track_3") return mid === "module_machine_learning" || mid === "module_ioai_machine_learning";
        return mid === "module_deep_learning" || mid.includes("ioai_") || mid === "module_advanced_ai";
      });

      // Filter by search query if any
      const filteredModules = trackModules.map((m: any) => {
        if (!searchQuery.trim()) return m;
        const q = searchQuery.toLowerCase();
        const matchingLessons = (m.lessons || []).filter(
          (l: any) => l.title?.toLowerCase().includes(q) || l.id?.toLowerCase().includes(q)
        );
        return { ...m, lessons: matchingLessons };
      }).filter((m: any) => m.lessons && m.lessons.length > 0 || !searchQuery.trim());

      const allLessons = trackModules.flatMap((m: any) => m.lessons || []);
      const completedCount = allLessons.filter((l: any) => l.is_completed).length;
      const totalCount = allLessons.length;
      const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      return {
        ...t,
        modules: filteredModules,
        completedCount,
        totalCount,
        progressPercent,
      };
    });
  }, [curriculum, searchQuery]);

  return (
    <div className="h-full flex flex-col bg-zinc-900/60 border-r border-zinc-800/80 select-none overflow-hidden">
      {/* Header Tabs */}
      <div className="h-9 px-2 border-b border-zinc-800/80 bg-zinc-950 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab("CURRICULUM")}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              activeTab === "CURRICULUM"
                ? "bg-zinc-850 text-indigo-400 border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Pohon Kurikulum (46)</span>
          </button>
          <button
            onClick={() => setActiveTab("FILES")}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              activeTab === "FILES"
                ? "bg-zinc-850 text-indigo-400 border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data & Files</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-zinc-800/60 bg-zinc-900/40 shrink-0">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari materi rumus atau kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded pl-8 pr-2.5 py-1 text-[11px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 font-sans"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2.5">
        {activeTab === "CURRICULUM" ? (
          <div className="space-y-2">
            {organizedTracks.map((track) => {
              const isExpanded = expandedTracks[track.key];

              return (
                <div
                  key={track.id}
                  className="rounded border border-zinc-800/80 bg-zinc-950/50 overflow-hidden"
                >
                  {/* Track Header */}
                  <button
                    onClick={() => toggleTrack(track.key)}
                    className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-zinc-850/50 transition-colors"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-mono text-indigo-400 font-semibold">
                            {track.number}
                          </span>
                          <span className="text-[12px] font-medium text-zinc-200 truncate">
                            {track.title}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">{track.subtitle}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-500 shrink-0 pl-1">
                      {track.progressPercent}%
                    </span>
                  </button>

                  {/* Modules in this Track */}
                  {isExpanded && (
                    <div className="border-t border-zinc-800/60 p-1 space-y-1 bg-zinc-900/30">
                      {track.modules.map((mod: any) => (
                        <div key={mod.id} className="space-y-0.5">
                          <div className="px-2 py-1 text-[10.5px] font-mono text-zinc-400 font-medium truncate flex items-center justify-between">
                            <span className="truncate">{mod.title}</span>
                          </div>

                          {/* Lessons */}
                          <div className="pl-1.5 space-y-0.5">
                            {(mod.lessons || []).map((les: any) => {
                              const isActive = activeLessonId === les.id;
                              return (
                                <button
                                  key={les.id}
                                  onClick={() => setActiveLessonId(les.id)}
                                  className={`w-full px-2 py-1.5 rounded flex items-center justify-between text-left transition-colors text-[11px] group ${
                                    isActive
                                      ? "bg-indigo-500/15 border border-indigo-500/30 text-indigo-200"
                                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                                  }`}
                                >
                                  <div className="flex items-center space-x-2 min-w-0">
                                    {les.is_completed ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    ) : les.type === "CODING" ? (
                                      <FileCode
                                        className={`w-3.5 h-3.5 shrink-0 ${
                                          isActive ? "text-indigo-400" : "text-zinc-500"
                                        }`}
                                      />
                                    ) : (
                                      <BookOpen
                                        className={`w-3.5 h-3.5 shrink-0 ${
                                          isActive ? "text-indigo-400" : "text-zinc-500"
                                        }`}
                                      />
                                    )}
                                    <span className="truncate">{les.title}</span>
                                  </div>

                                  {les.video_url && (
                                    <Video
                                      className={`w-3 h-3 shrink-0 ${
                                        isActive ? "text-indigo-400" : "text-zinc-600"
                                      }`}
                                    />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Tab Files & Datasets */
          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-mono text-zinc-500 px-1 py-0.5">
                DATASETS KOMPETISI (DATA/DATASETS)
              </div>
              <div className="space-y-0.5 mt-1">
                {[
                  "titanic_train.csv",
                  "house_prices.csv",
                  "iris_matrix.csv",
                  "creditcard_fraud.csv",
                ].map((file) => (
                  <div
                    key={file}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded bg-zinc-950/40 border border-zinc-800/60 text-zinc-300 text-[11px] font-mono"
                  >
                    <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{file}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-zinc-500 px-1 py-0.5">
                MODUL MARKDOWN CURRICULUM (46 FILES)
              </div>
              <div className="space-y-0.5 mt-1 max-h-64 overflow-y-auto">
                {[
                  "cs50p_00_functions.md",
                  "cs50p_01_conditionals.md",
                  "ioai_01_linear_algebra.md",
                  "ioai_02_calculus_optimization.md",
                  "ioai_05_preprocessing_pca.md",
                  "ioai_09_perceptron_activation.md",
                  "ioai_10_backprop_optimizers.md",
                  "ioai_11_pytorch_deep_learning.md",
                  "ioai_17_transformers_llm.md",
                ].map((file) => (
                  <div
                    key={file}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded bg-zinc-950/40 border border-zinc-800/60 text-zinc-400 text-[11px] font-mono"
                  >
                    <FileCode className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    <span className="truncate">{file}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
