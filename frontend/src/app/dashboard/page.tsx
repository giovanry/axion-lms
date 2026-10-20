"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Database,
  Flame,
  Layers,
  Trophy,
  Compass,
} from "lucide-react";
import { RoadmapSection } from "@/components/roadmap/RoadmapSection";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

export default function DashboardPage() {
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [ollamaStatus, setOllamaStatus] = useState<boolean | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check if onboarding completed
    const onboarded = localStorage.getItem("axion_onboarding_completed");
    if (!onboarded) {
      setIsOnboardingOpen(true);
    }

    // 1. Fetch user stats
    fetch("/api/v1/user/stats")
      .then((res) => res.json())
      .then((data) => setUserStats(data))
      .catch((err) => console.error(err));

    // 2. Fetch curriculum
    fetch("/api/v1/curriculum")
      .then((res) => res.json())
      .then((data) => setCurriculum(data))
      .catch((err) => console.error(err));

    // 3. Fetch Ollama status
    fetch("/api/v1/ai/status")
      .then((res) => res.json())
      .then((data) => setOllamaStatus(data.active))
      .catch(() => setOllamaStatus(false));
  }, []);

  const totalLessons = curriculum.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const completedLessons = curriculum.reduce(
    (acc, m) => acc + (m.lessons?.filter((l: any) => l.is_completed)?.length || 0),
    0
  );
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Find first incomplete lesson to recommend for quick continuation
  let nextLesson = null;
  for (const m of curriculum) {
    for (const l of m.lessons || []) {
      if (!l.is_completed) {
        nextLesson = l;
        break;
      }
    }
    if (nextLesson) break;
  }
  if (!nextLesson && curriculum.length > 0 && curriculum[0].lessons?.length > 0) {
    nextLesson = curriculum[0].lessons[0];
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-root space-y-6 max-w-6xl mx-auto w-full">
      {/* Welcome & Learning Progress Hero Section */}
      <div className="p-6 bg-surface border border-border-def rounded space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-meta text-primary font-mono px-2 py-0.5 bg-primary-muted rounded border border-primary/30">
                PERSONAL LMS DASHBOARD
              </span>
              <span className="text-meta text-slate-400 font-mono">
                {userStats?.name || "Axion Scholar"}
              </span>
            </div>
            <h1 className="text-page-title text-slate-100 font-semibold text-lg">
              Sistem Pembelajaran Mandiri Python, Data Science & AI
            </h1>
            <p className="text-body text-slate-300 max-w-2xl leading-relaxed">
              Platform lokal terintegrasi untuk menguasai arsitektur model AI, komputasi matriks berakselerasi GPU
              CUDA, dan penyelesaian masalah algoritma kompetitif.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-3 bg-elevated p-3.5 rounded border border-border-def shrink-0">
            <div className="text-center px-2">
              <span className="text-meta text-slate-400 font-mono block">STREAK</span>
              <div className="flex items-center justify-center space-x-1 text-amber-400 font-mono font-bold text-section-header">
                <Flame className="w-4 h-4 fill-current text-amber-500" />
                <span>{userStats?.daily_streak ?? 1} hari</span>
              </div>
            </div>
            <div className="w-px h-8 bg-border-def" />
            <div className="text-center px-2">
              <span className="text-meta text-slate-400 font-mono block">PROGRESS</span>
              <span className="text-section-header font-mono font-bold text-primary">
                {progressPercent}%
              </span>
            </div>
            <div className="w-px h-8 bg-border-def" />
            <div className="text-center px-2">
              <span className="text-meta text-slate-400 font-mono block">SELESAI</span>
              <span className="text-section-header font-mono font-bold text-slate-200">
                {completedLessons}/{totalLessons}
              </span>
            </div>
          </div>
        </div>

        {/* Continuation Action Banner */}
        <div className="pt-3 border-t border-border-def flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-body text-slate-300">
            <span className="text-slate-400">Pelajaran Selanjutnya: </span>
            <span className="font-semibold text-slate-100">
              {nextLesson?.title || "1.1 Model Memori & Operasi Vektor Python"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-elevated hover:bg-root border border-border-def rounded text-label font-medium text-slate-300 hover:text-white transition-colors min-h-[36px]"
            >
              <Compass className="w-3.5 h-3.5 text-primary" />
              <span>Panduan Onboarding</span>
            </button>
            <Link
              href="/roadmap"
              className="px-3.5 py-1.5 bg-elevated hover:bg-root border border-border-def rounded text-label font-medium text-slate-300 transition-colors min-h-[36px] flex items-center"
            >
              Lihat Roadmap Lengkap
            </Link>
            <Link
              href={`/learn?lesson=${nextLesson?.id || "py_01_syntax"}`}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-primary hover:bg-primary-hover text-white rounded text-label font-medium transition-colors min-h-[36px]"
            >
              <span>Lanjutkan Belajar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Main Sectors Roadmap Section */}
      <div id="roadmap-section" className="pt-2">
        <RoadmapSection curriculum={curriculum} />
      </div>

      {/* Feature Navigation Cards (Playground, Kaggle, Leaderboard) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Codeforces Playground Card */}
        <div className="p-4 bg-surface border border-border-def rounded space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-primary">
              <Code2 className="w-5 h-5" />
              <h3 className="text-section-header text-slate-100 font-semibold">
                Codeforces Playground
              </h3>
            </div>
            <p className="text-body text-slate-400 leading-relaxed">
              Latihan algoritma dan competitive programming Python. Dilengkapi terjemahan Bahasa Indonesia via
              Gemini 3.6 (fallback Llama 3) dan runner kasus uji otomatis.
            </p>
          </div>
          <Link
            href="/playground"
            className="flex items-center justify-between px-3 py-2 bg-elevated hover:bg-root border border-border-def rounded text-label font-medium text-slate-200 transition-colors min-h-[40px]"
          >
            <span>Buka Codeforces Playground</span>
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
          </Link>
        </div>

        {/* Kaggle & Dataset Browser Card */}
        <div className="p-4 bg-surface border border-border-def rounded space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-primary">
              <Database className="w-5 h-5" />
              <h3 className="text-section-header text-slate-100 font-semibold">
                Dataset & Kaggle Engine
              </h3>
            </div>
            <p className="text-body text-slate-400 leading-relaxed">
              Telusuri dataset publik Kaggle, inisialisasi kode eksplorasi EDA secara otomatis, serta kelola
              penyimpanan lokal dengan jadwal pembersihan 14 hari.
            </p>
          </div>
          <Link
            href="/datasets"
            className="flex items-center justify-between px-3 py-2 bg-elevated hover:bg-root border border-border-def rounded text-label font-medium text-slate-200 transition-colors min-h-[40px]"
          >
            <span>Kelola Dataset Kaggle</span>
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
          </Link>
        </div>

        {/* Experiment Leaderboard Card */}
        <div className="p-4 bg-surface border border-border-def rounded space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-primary">
              <Trophy className="w-5 h-5" />
              <h3 className="text-section-header text-slate-100 font-semibold">
                Papan Peringkat Model
              </h3>
            </div>
            <p className="text-body text-slate-400 leading-relaxed">
              Pantau akurasi, F1-Score, dan parameter eksperimen model machine learning Anda yang dicatat menggunakan
              dekorator lokal <code className="font-mono text-primary">@lms_track_accuracy</code>.
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="flex items-center justify-between px-3 py-2 bg-elevated hover:bg-root border border-border-def rounded text-label font-medium text-slate-200 transition-colors min-h-[40px]"
          >
            <span>Lihat Papan Peringkat</span>
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
          </Link>
        </div>
      </div>

      {/* Onboarding Guide Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
