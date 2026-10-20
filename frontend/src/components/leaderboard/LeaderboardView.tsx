"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING_SNAPPY, SPRING_SMOOTH, SPRING_BOUNCY } from "@/lib/motion-config";
import { AnimatedTabContent, StaggerContainer, StaggerItem } from "@/components/ui/motion-primitives";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart2,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  Layers,
  Medal,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { fetchWithCache, invalidateCache } from "@/lib/apiCache";
import { useDebounce } from "@/hooks/useDebounce";

interface SolutionRun {
  id: number;
  rank: number;
  model_name: string;
  solution_version?: string;
  pipeline_flow: string;
  accuracy_score: number;
  f1_score?: number | null;
  parameters: Record<string, any>;
  timestamp: string;
  notebook_id?: number | null;
  dataset_id?: number | null;
  dataset_ref?: string;
  is_best?: boolean;
}

interface KaggleCompetition {
  dataset_ref: string;
  dataset_id?: number | null;
  dataset_title: string;
  category: string;
  badge: string;
  problem_statement: string;
  evaluation_metric: string;
  dataset_rows: string;
  overview_markdown: string;
  total_models: number;
  best_accuracy: number;
  best_model: string;
  best_version?: string;
  best_pipeline: string;
  runs: SolutionRun[];
}

export const LeaderboardView: React.FC = () => {
  const [competitions, setCompetitions] = useState<KaggleCompetition[]>([]);
  const [activeCompetitionRef, setActiveCompetitionRef] = useState<string | null>(null);
  const [competitionTab, setCompetitionTab] = useState<"leaderboard" | "overview" | "winning_flow">("leaderboard");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 280);
  const [runsVisibleLimit, setRunsVisibleLimit] = useState<number>(50);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCompetitions = async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    if (forceRefresh) {
      invalidateCache("/api/v1/leaderboard/by-dataset");
    }
    try {
      const data: KaggleCompetition[] = await fetchWithCache(
        "/api/v1/leaderboard/by-dataset",
        undefined,
        60_000
      );
      if (Array.isArray(data)) {
        setCompetitions(data);
      }
    } catch (err) {
      console.error("Gagal memuat kompetisi Kaggle:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  // Filter competitions by search & category
  const filteredCompetitions = useMemo(() => {
    return competitions.filter((comp) => {
      const matchesSearch =
        !debouncedSearchQuery.trim() ||
        comp.dataset_title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        comp.dataset_ref.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        comp.problem_statement.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" ||
        comp.category.toUpperCase().includes(selectedCategory.toUpperCase());

      return matchesSearch && matchesCategory;
    });
  }, [competitions, debouncedSearchQuery, selectedCategory]);

  // Active competition if opened
  const activeCompetition = useMemo(() => {
    if (!activeCompetitionRef) return null;
    return competitions.find((c) => c.dataset_ref === activeCompetitionRef) || null;
  }, [competitions, activeCompetitionRef]);

  // Parse pipeline flow string into steps
  const parsePipelineSteps = (flow: string): string[] => {
    if (!flow) return [];
    return flow
      .split("→")
      .flatMap((s) => s.split("->"))
      .map((s) => s.trim())
      .filter(Boolean);
  };

  // --- SUB-VIEW: DETAIL KAGGLE COMPETITION & LEADERBOARD ---
  if (activeCompetition) {
    const championRun = activeCompetition.runs[0] || null;

    return (
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-root max-w-6xl mx-auto min-h-screen">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveCompetitionRef(null)}
            className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Daftar Soal Kaggle</span>
          </button>

          <button
            onClick={() => fetchCompetitions(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-surface hover:bg-elevated border border-border-def rounded text-meta text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan Data</span>
          </button>
        </div>

        {/* Kaggle Competition Hero Header */}
        <div className="rounded-xl border border-border-def bg-surface p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-mono font-bold uppercase tracking-wider">
                  {activeCompetition.badge}
                </span>
                <span className="text-meta font-mono text-slate-400">
                  Dataset: <code className="text-slate-200">{activeCompetition.dataset_ref}</code>
                </span>
                <span className="text-meta font-mono text-slate-500">•</span>
                <span className="text-meta font-mono text-slate-400">
                  {activeCompetition.dataset_rows}
                </span>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
                  {activeCompetition.dataset_title}
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  {activeCompetition.problem_statement}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 pt-1">
                <div className="flex items-center space-x-1.5 bg-elevated px-2.5 py-1 rounded border border-border-def">
                  <Tag className="w-3 h-3 text-primary" />
                  <span>Metrik: {activeCompetition.evaluation_metric}</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-elevated px-2.5 py-1 rounded border border-border-def">
                  <Users className="w-3 h-3 text-amber-400" />
                  <span>Total Solusi: {activeCompetition.total_models} Alur Model</span>
                </div>
              </div>
            </div>

            {/* Top Score Box & Action */}
            <div className="flex flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border-def">
              <div className="text-left lg:text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Skor Tertinggi (1st Place)
                </span>
                {activeCompetition.runs.length > 0 && activeCompetition.best_accuracy > 0 ? (
                  <>
                    <div className="text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
                      {(activeCompetition.best_accuracy * 100).toFixed(2)}%
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Score: {activeCompetition.best_accuracy.toFixed(5)} ({activeCompetition.best_model} - {activeCompetition.best_version || "v1.0"})
                    </span>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-bold font-mono text-slate-400 tracking-tight mt-1">
                      Belum Ada Run
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Jalankan kode & submit solusi pertama
                    </span>
                  </>
                )}
              </div>

              <Link
                href={`/notebooks?dataset=${encodeURIComponent(activeCompetition.dataset_ref)}`}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-md shadow-primary/25 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Buka Workspace Notebook</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Competition Sub-Navigation Tabs with Shared Sliding Pill */}
        <div className="flex items-center space-x-2 border-b border-border-def relative">
          <button
            onClick={() => setCompetitionTab("leaderboard")}
            className={`relative flex items-center space-x-2 py-2.5 px-4 text-xs font-semibold transition-colors z-10 cursor-pointer ${
              competitionTab === "leaderboard"
                ? "text-primary font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {competitionTab === "leaderboard" && (
              <motion.div
                layoutId="leaderboard-tab-pill"
                className="absolute inset-0 bg-primary/10 rounded-t border-b-2 border-primary -z-10"
                transition={SPRING_SNAPPY}
              />
            )}
            <Trophy className="w-3.5 h-3.5" />
            <span>Papan Peringkat (Leaderboard)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-elevated text-[10px] font-mono text-slate-400">
              {activeCompetition.runs.length}
            </span>
          </button>

          <button
            onClick={() => setCompetitionTab("winning_flow")}
            className={`relative flex items-center space-x-2 py-2.5 px-4 text-xs font-semibold transition-colors z-10 cursor-pointer ${
              competitionTab === "winning_flow"
                ? "text-primary font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {competitionTab === "winning_flow" && (
              <motion.div
                layoutId="leaderboard-tab-pill"
                className="absolute inset-0 bg-primary/10 rounded-t border-b-2 border-primary -z-10"
                transition={SPRING_SNAPPY}
              />
            )}
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Alur Solusi Juara (#1 Flow)</span>
          </button>

          <button
            onClick={() => setCompetitionTab("overview")}
            className={`relative flex items-center space-x-2 py-2.5 px-4 text-xs font-semibold transition-colors z-10 cursor-pointer ${
              competitionTab === "overview"
                ? "text-primary font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {competitionTab === "overview" && (
              <motion.div
                layoutId="leaderboard-tab-pill"
                className="absolute inset-0 bg-primary/10 rounded-t border-b-2 border-primary -z-10"
                transition={SPRING_SNAPPY}
              />
            )}
            <BookOpen className="w-3.5 h-3.5" />
            <span>Deskripsi Soal & Aturan</span>
          </button>
        </div>

        <AnimatedTabContent tabKey={competitionTab}>
        {/* TAB 1: KAGGLE COMPETITION LEADERBOARD */}
        {competitionTab === "leaderboard" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-mono">
                Public Leaderboard — Peringkat Solusi Model Berdasarkan Akurasi
              </span>
              <span className="font-mono text-slate-500">
                Dievaluasi otomatis melalui sistem evaluasi Axion
              </span>
            </div>

            {activeCompetition.runs.length === 0 ? (
              <div className="p-10 md:p-14 text-center border border-border-def rounded-xl bg-surface space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto text-primary">
                  <Trophy className="w-7 h-7 opacity-80" />
                </div>
                <div className="space-y-2 max-w-lg mx-auto">
                  <h3 className="text-base font-bold text-slate-100">
                    Papan Peringkat Kompetisi Masih Kosong
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Belum ada solusi yang dikirimkan untuk tantangan ini. Buka workspace notebook, jalankan kode machine learning Anda, lalu klik tombol <strong className="text-amber-300">Submit Solusi</strong> di notebook untuk mencatat akurasi versi solusi Anda ke papan peringkat!
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href={`/notebooks?dataset=${encodeURIComponent(activeCompetition.dataset_ref)}`}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/25 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>+ Buka Workspace Notebook & Mulai Solusi</span>
                  </Link>
                </div>

                <div className="pt-4 max-w-xl mx-auto text-left">
                  <div className="bg-elevated p-4 rounded-lg border border-border-def text-[11px] font-mono text-slate-300 space-y-2">
                    <span className="text-primary font-bold block">// Atau submit langsung via Python script di dalam notebook:</span>
                    <pre className="text-slate-400 overflow-x-auto text-[11px] leading-relaxed">
{`from backend.olympus_tracker import track_accuracy

track_accuracy(
    model_name="RandomForestClassifier",
    solution_version="v1.0 - Baseline",
    accuracy=0.965,
    f1=0.960,
    dataset_ref="${activeCompetition.dataset_ref}",
    pipeline_flow="StandardScaler → PCA → RandomForest"
)`}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-border-def rounded-xl bg-surface overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-elevated border-b border-border-def text-meta text-slate-400 font-mono">
                        <th className="py-3 px-4 w-16 text-center">Rank</th>
                        <th className="py-3 px-4">Model & Versi Solusi</th>
                        <th className="py-3 px-4 min-w-[260px]">Alur Penyelesaian (Pipeline Steps)</th>
                        <th className="py-3 px-4 text-right">Score (Akurasi)</th>
                        <th className="py-3 px-4 text-right">F1-Score</th>
                        <th className="py-3 px-4">Hiperparameter</th>
                        <th className="py-3 px-4 text-right">Last Run</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-def text-label">
                      {activeCompetition.runs.slice(0, runsVisibleLimit).map((run, idx) => {
                        const isChampion = idx === 0;
                        return (
                          <tr
                            key={run.id}
                            className={`transition-colors ${
                              isChampion
                                ? "bg-amber-500/5 hover:bg-amber-500/10"
                                : "hover:bg-elevated/50"
                            }`}
                          >
                            {/* Rank Medal */}
                            <td className="py-3.5 px-4 text-center font-mono">
                              {idx === 0 ? (
                                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-sm shadow-amber-500/20 font-bold text-xs">
                                  🥇 1
                                </div>
                              ) : idx === 1 ? (
                                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/15 text-slate-200 border border-slate-400/40 font-bold text-xs">
                                  🥈 2
                                </div>
                              ) : idx === 2 ? (
                                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/40 font-bold text-xs">
                                  🥉 3
                                </div>
                              ) : (
                                <span className="text-slate-500 text-meta font-mono font-semibold">
                                  #{idx + 1}
                                </span>
                              )}
                            </td>

                            {/* Model & Solution Version */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <Cpu
                                    className={`w-4 h-4 shrink-0 ${
                                      isChampion ? "text-amber-400" : "text-primary"
                                    }`}
                                  />
                                  <span className={`font-semibold ${isChampion ? "text-amber-200" : "text-slate-100"}`}>
                                    {run.model_name}
                                  </span>
                                  {isChampion && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-[9px] font-mono text-amber-300 uppercase font-bold">
                                      Champion
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="px-1.5 py-0.5 rounded bg-elevated border border-border-def text-[10px] font-mono text-primary font-medium">
                                    {run.solution_version || "v1.0"}
                                  </span>
                                  {run.notebook_id && (
                                    <Link
                                      href={`/notebooks/${run.notebook_id}`}
                                      className="text-[10px] font-mono text-slate-400 hover:text-primary transition-colors inline-flex items-center space-x-0.5"
                                    >
                                      <span>Notebook #{run.notebook_id}</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Pipeline Steps */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap items-center gap-1">
                                {parsePipelineSteps(run.pipeline_flow).map((step, sIdx, sArr) => (
                                  <React.Fragment key={sIdx}>
                                    <span
                                      className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                                        isChampion
                                          ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                                          : "bg-elevated border-border-def text-slate-300"
                                      }`}
                                    >
                                      {step}
                                    </span>
                                    {sIdx < sArr.length - 1 && (
                                      <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </td>

                            {/* Score (Accuracy) formatted Kaggle-style */}
                            <td className="py-3.5 px-4 text-right font-mono">
                              <div className="flex flex-col items-end">
                                <span
                                  className={`font-bold text-sm ${
                                    isChampion ? "text-emerald-400" : "text-slate-200"
                                  }`}
                                >
                                  {run.accuracy_score.toFixed(5)}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  ({(run.accuracy_score * 100).toFixed(2)}%)
                                </span>
                              </div>
                            </td>

                            {/* F1 Score */}
                            <td className="py-3.5 px-4 text-right font-mono text-slate-300 text-xs">
                              {run.f1_score !== undefined && run.f1_score !== null
                                ? run.f1_score.toFixed(5)
                                : "N/A"}
                            </td>

                            {/* Hyperparameters */}
                            <td className="py-3.5 px-4 font-mono text-meta text-slate-400 max-w-[220px]">
                              {Object.keys(run.parameters).length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(run.parameters)
                                    .slice(0, 3)
                                    .map(([k, v]) => (
                                      <span
                                        key={k}
                                        className="px-1.5 py-0.5 rounded bg-elevated/70 border border-border-def/60 text-[10px] text-slate-300 truncate"
                                        title={`${k}: ${JSON.stringify(v)}`}
                                      >
                                        {k}: {String(v)}
                                      </span>
                                    ))}
                                </div>
                              ) : (
                                <span className="text-slate-600 italic">Default</span>
                              )}
                            </td>

                            {/* Last Run */}
                            <td className="py-3.5 px-4 text-right font-mono text-meta text-slate-500 whitespace-nowrap">
                              {new Date(run.timestamp).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {runsVisibleLimit < activeCompetition.runs.length && (
                  <div className="p-3 bg-surface border-t border-border-def text-center">
                    <button
                      type="button"
                      onClick={() => setRunsVisibleLimit((prev) => prev + 50)}
                      className="px-4 py-1.5 bg-elevated hover:bg-surface border border-border-def hover:border-primary/50 text-slate-300 hover:text-white text-xs font-mono rounded transition-colors"
                    >
                      Tampilkan 50 Solusi Berikutnya ({activeCompetition.runs.length - runsVisibleLimit} tersisa)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WINNING PIPELINE FLOW */}
        {competitionTab === "winning_flow" && (
          championRun ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-amber-500/30 bg-surface p-6 space-y-4">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <Trophy className="w-4 h-4" />
                  <span>Alur Solusi Peringkat #1: {championRun.model_name} ({championRun.solution_version || "v1.0"})</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  Alur ini menghasilkan akurasi tertinggi sebesar{" "}
                  <strong className="text-emerald-400">
                    {(championRun.accuracy_score * 100).toFixed(2)}%
                  </strong>{" "}
                  melalui rangkaian tahapan terarah:
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {parsePipelineSteps(championRun.pipeline_flow).map((step, idx, arr) => (
                    <React.Fragment key={idx}>
                      <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-elevated border border-amber-500/30 text-xs text-slate-100 shadow-md">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-mono font-medium">{step}</span>
                      </div>
                      {idx < arr.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-amber-400/80 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Horizontal Comparative Bar Chart */}
              <div className="border border-border-def rounded-xl bg-surface p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span>Grafik Komparasi Akurasi Seluruh Solusi</span>
                </h3>

                <div className="space-y-2.5 pt-2">
                  {activeCompetition.runs.map((r, i) => (
                    <div key={r.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-300">
                          #{r.rank} {r.model_name} <span className="text-primary font-mono text-[10px]">({r.solution_version || "v1.0"})</span>
                        </span>
                        <span className="font-mono font-bold text-slate-200">
                          {(r.accuracy_score * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="w-full bg-elevated h-2 rounded-full overflow-hidden border border-border-def">
                        <div
                          className={`h-full rounded-full ${
                            i === 0
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                              : "bg-primary/70"
                          }`}
                          style={{ width: `${Math.max(r.accuracy_score * 100, 5)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-border-def rounded-xl bg-surface space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-amber-400/60" />
              <h3 className="text-sm font-semibold text-slate-200">Belum Ada Alur Pemenang</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Kirim solusi model pertama Anda untuk mengisi takhta #1 dan menampilkan alur pipeline juara di halaman ini!
              </p>
              <div className="pt-2">
                <Link
                  href={`/notebooks?dataset=${encodeURIComponent(activeCompetition.dataset_ref)}`}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Buka Workspace Notebook</span>
                </Link>
              </div>
            </div>
          )
        )}

        {/* TAB 3: OVERVIEW & RULES */}
        {competitionTab === "overview" && (
          <div className="rounded-xl border border-border-def bg-surface p-6 space-y-4 text-slate-300 text-xs leading-relaxed">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>Deskripsi Tantangan & Panduan Submission</span>
            </h3>

            <div className="prose prose-invert max-w-none text-xs space-y-3">
              <p>{activeCompetition.overview_markdown}</p>
              <div className="bg-elevated p-4 rounded-lg border border-border-def font-mono text-[11px] space-y-2">
                <span className="text-primary block font-bold">
                  // Cara Mencatat Solusi Baru ke Leaderboard (Python Notebook):
                </span>
                <pre className="text-slate-400 overflow-x-auto">
{`from backend.olympus_tracker import track_accuracy

# Catat metrik evaluasi model Anda:
track_accuracy(
  model_name="Model_Nama_Anda",
  accuracy=0.985,
  f1=0.983,
  dataset_ref="${activeCompetition.dataset_ref}",
  pipeline_flow="DataPrep → FeatureEngineering → Model",
  parameters={"epochs": 50, "lr": 0.001}
)`}
                </pre>
              </div>
            </div>
          </div>
        )}
        </AnimatedTabContent>
      </div>
    );
  }

  // --- MAIN VIEW: DAFTAR SOAL & KOMPETISI KAGGLE ---
  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-root max-w-6xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-def">
        <div>
          <div className="flex items-center space-x-2 text-meta text-primary font-mono">
            <Trophy className="w-3.5 h-3.5" />
            <span>KAGGLE COMPETITIONS & CHALLENGES</span>
          </div>
          <h1 className="text-page-title text-slate-100 font-semibold tracking-tight mt-0.5">
            Daftar Soal & Kompetisi Kaggle
          </h1>
          <p className="text-meta text-slate-400 mt-1 max-w-2xl">
            Pilih soal tantangan machine learning di bawah untuk mengeksplorasi papan peringkat akurasi (*leaderboard*), membandingkan alur solusi, atau memulai eksperimen pemodelan Anda.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={SPRING_SNAPPY}
            onClick={() => fetchCompetitions(true)}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface hover:bg-elevated border border-border-def rounded text-label text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </motion.button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills with Shared Sliding Pill */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 relative">
          {["ALL", "GETTING STARTED", "TABULAR", "COMPUTER VISION"].map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative px-3 py-1.5 rounded-md text-xs font-mono transition-colors shrink-0 z-10 cursor-pointer ${
                  isSelected
                    ? "text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="leaderboard-cat-pill"
                    className="absolute inset-0 bg-primary rounded-md shadow-sm -z-10"
                    transition={SPRING_SNAPPY}
                  />
                )}
                {cat === "ALL" ? "Semua Soal" : cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama soal / dataset..."
            className="w-full bg-surface border border-border-def rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Competition Cards Grid with StaggerContainer */}
      {isLoading && competitions.length === 0 ? (
        <div className="p-16 text-center text-slate-500 font-mono border border-border-def rounded-xl bg-surface space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" />
          <p>Memuat daftar soal kompetisi Kaggle...</p>
        </div>
      ) : filteredCompetitions.length === 0 ? (
        <div className="p-16 text-center text-slate-500 border border-border-def rounded-xl bg-surface space-y-3">
          <Database className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-slate-300 font-medium">Tidak ada soal kompetisi yang cocok.</p>
          <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau kategori filter.</p>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompetitions.map((comp) => (
            <StaggerItem key={comp.dataset_ref}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={SPRING_SNAPPY}
                onClick={() => setActiveCompetitionRef(comp.dataset_ref)}
                className="h-full group cursor-pointer rounded-xl border border-border-def hover:border-primary/50 bg-surface hover:bg-elevated/40 p-5 flex flex-col justify-between transition-all duration-150 shadow-md hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="space-y-3">
                  {/* Header Tag */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 border border-primary/30 text-primary uppercase">
                      {comp.badge}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {comp.dataset_rows}
                    </span>
                  </div>

                  {/* Title & Problem Statement */}
                  <div>
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-primary transition-colors line-clamp-1">
                      {comp.dataset_title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {comp.problem_statement}
                    </p>
                  </div>

                  {/* Evaluation Metric Badge */}
                  <div className="pt-1">
                    <span className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-slate-300 bg-elevated px-2 py-1 rounded border border-border-def">
                      <Tag className="w-3 h-3 text-primary" />
                      <span className="truncate">{comp.evaluation_metric}</span>
                    </span>
                  </div>
                </div>

                {/* Card Footer: Top Accuracy & Open Action */}
                <div className="pt-4 mt-4 border-t border-border-def/60 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">
                        Top Accuracy
                      </span>
                      {comp.total_models > 0 && comp.best_accuracy > 0 ? (
                        <span className="text-sm font-bold font-mono text-emerald-400">
                          {(comp.best_accuracy * 100).toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-slate-500">
                          Belum ada run
                        </span>
                      )}
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">
                        Solusi
                      </span>
                      <span className="text-xs font-mono text-slate-300">
                        {comp.total_models} Alur
                      </span>
                    </div>
                  </div>

                  <div className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-elevated group-hover:bg-primary text-slate-200 group-hover:text-white text-xs font-semibold border border-border-def group-hover:border-primary transition-all">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Buka Papan Peringkat Kompetisi</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
};

