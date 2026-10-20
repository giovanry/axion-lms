"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SPRING_SNAPPY,
  SPRING_SMOOTH,
  SPRING_BOUNCY,
  EASE_OUT_EXPO,
} from "@/lib/motion-config";
import {
  MotionButton,
  AnimatedTabContent,
  ActiveTabPill,
} from "@/components/ui/motion-primitives";
import {
  Sparkles,
  BookOpen,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Code2,
  Bot,
  Zap,
  Play,
  Flame,
  X,
  Compass,
} from "lucide-react";
import Link from "next/link";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  { id: 1, title: "Selamat Datang", label: "Pengenalan" },
  { id: 2, title: "4 Jalur Belajar", label: "Kurikulum" },
  { id: 3, title: "Ergonomi Workspace", label: "Fitur Unggulan" },
  { id: 4, title: "Siap Belajar", label: "Mulai" },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTrack, setSelectedTrack] = useState<string>("track_1");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && currentStep < 4) setCurrentStep((s) => s + 1);
      if (e.key === "ArrowLeft" && currentStep > 1) setCurrentStep((s) => s - 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep, onClose]);

  const handleComplete = () => {
    localStorage.setItem("axion_onboarding_completed", "true");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with VS Code style subtle dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Dialog Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={SPRING_SMOOTH}
            className="relative w-full max-w-3xl bg-[#1e1e1e] border border-[#333333] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Window Title Bar (VS Code Header Style) */}
            <div className="h-10 bg-[#252526] border-b border-[#333333] px-4 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5 mr-2">
                  <div className="w-3 h-3 rounded-full bg-[#3c3c3c] hover:bg-rose-500 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-[#3c3c3c] hover:bg-amber-500 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-[#3c3c3c] hover:bg-emerald-500 transition-colors" />
                </div>
                <Compass className="w-4 h-4 text-[#007acc]" />
                <span className="text-label font-medium text-[#cccccc] font-mono">
                  Axion Precision LMS — Onboarding Guide
                </span>
                <span className="px-1.5 py-0.2 bg-[#007acc]/20 text-[#007acc] border border-[#007acc]/40 rounded text-[10px] font-mono">
                  VS CODE DARK THEME
                </span>
              </div>

              <button
                onClick={onClose}
                className="text-[#858585] hover:text-[#cccccc] p-1 rounded hover:bg-[#333333] transition-colors"
                title="Tutup (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Navigation Bar with Shared Layout Sliding Pill */}
            <div className="flex border-b border-[#333333] bg-[#181818] px-4 pt-2 shrink-0 overflow-x-auto relative">
              {STEPS.map((s) => {
                const isActive = currentStep === s.id;
                const isPassed = currentStep > s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentStep(s.id)}
                    className={`relative px-4 py-2 text-label font-medium transition-colors flex items-center space-x-2 shrink-0 z-10 ${
                      isActive
                        ? "text-[#007acc]"
                        : isPassed
                        ? "text-emerald-400 hover:text-emerald-300"
                        : "text-[#858585] hover:text-[#cccccc]"
                    }`}
                  >
                    {isActive && (
                      <ActiveTabPill
                        layoutId="onboarding-step-pill"
                        className="absolute inset-0 bg-[#252526] rounded-t border-t-2 border-[#007acc] -z-0"
                      />
                    )}
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono relative z-10 ${
                        isPassed
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-700"
                          : isActive
                          ? "bg-[#007acc] text-white"
                          : "bg-[#252526] text-[#858585] border border-[#333333]"
                      }`}
                    >
                      {isPassed ? "✓" : s.id}
                    </span>
                    <span className="relative z-10">{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Step Body Content with Blur-Fade Transitions & Seamless Auto-Resize */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0 bg-[#1e1e1e]">
              <AnimatedTabContent tabKey={currentStep}>
                {/* STEP 1: WELCOME & OVERVIEW */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#007acc]/15 border border-[#007acc]/30 rounded text-[#007acc] text-meta font-mono">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>EKKA OSN • Olimpiade Sains Nasional Kecerdasan Artifisial</span>
                      </div>
                      <h2 className="text-xl font-semibold text-[#ffffff] tracking-tight">
                        Selamat Datang di <span className="text-[#007acc]">AXION</span> Precision LMS
                      </h2>
                      <p className="text-[#cccccc] text-body leading-relaxed max-w-2xl">
                        Platform pembelajaran mandiri lokal berstandar tinggi yang didesain khusus untuk
                        menguasai arsitektur model AI, komputasi matriks berakselerasi GPU CUDA, dan
                        pemrograman kompetitif dari nol.
                      </p>
                    </div>

                    {/* 4 Superpowers Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 bg-[#252526] border border-[#333333] rounded hover:border-[#007acc]/40 transition-colors space-y-1.5">
                        <div className="flex items-center space-x-2 text-[#007acc]">
                          <Layers className="w-4 h-4" />
                          <span className="text-label font-semibold text-[#ffffff]">
                            4-Track Linear Roadmap
                          </span>
                        </div>
                        <p className="text-meta text-[#9d9d9d] leading-relaxed">
                          Urutan materi sekuensial yang koheren: dari fondasi memori Python, aljabar linear NumPy, Scikit-Learn, hingga Deep Learning PyTorch.
                        </p>
                      </div>

                      <div className="p-3.5 bg-[#252526] border border-[#333333] rounded hover:border-[#007acc]/40 transition-colors space-y-1.5">
                        <div className="flex items-center space-x-2 text-amber-400">
                          <Code2 className="w-4 h-4" />
                          <span className="text-label font-semibold text-[#ffffff]">
                            Math-to-Code KaTeX Bridge
                          </span>
                        </div>
                        <p className="text-meta text-[#9d9d9d] leading-relaxed">
                          Menjembatani formulasi matematika murni (simbol LaTeX, dot product, cross-entropy) langsung ke implementasi kode Python tervektorisasi.
                        </p>
                      </div>

                      <div className="p-3.5 bg-[#252526] border border-[#333333] rounded hover:border-[#007acc]/40 transition-colors space-y-1.5">
                        <div className="flex items-center space-x-2 text-emerald-400">
                          <Terminal className="w-4 h-4" />
                          <span className="text-label font-semibold text-[#ffffff]">
                            Monaco Editor & Auto-Grader
                          </span>
                        </div>
                        <p className="text-meta text-[#9d9d9d] leading-relaxed">
                          Editor kode Python setara VS Code dengan umpan balik pengujian assert instan, rendering visual plot, dan traceback error yang elegan.
                        </p>
                      </div>

                      <div className="p-3.5 bg-[#252526] border border-[#333333] rounded hover:border-[#007acc]/40 transition-colors space-y-1.5">
                        <div className="flex items-center space-x-2 text-cyan-400">
                          <Bot className="w-4 h-4" />
                          <span className="text-label font-semibold text-[#ffffff]">
                            Socratic AI Tutor
                          </span>
                        </div>
                        <p className="text-meta text-[#9d9d9d] leading-relaxed">
                          Didukung Google Gemini 3.6 Flash & Ollama lokal dengan protokol kognitif anti-spoiler yang membimbing logika Anda tanpa memberi solusi mentah.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: 4-TRACK ROADMAP EXPLORER */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-section-header font-semibold text-[#ffffff]">
                        Pilih Fokus Jalur Pembelajaran Anda
                      </h3>
                      <p className="text-meta text-[#9d9d9d]">
                        Seluruh kurikulum telah disusun menjadi satu kesatuan alur belajar yang terpadu. Klik salah satu jalur untuk melihat ringkasan:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Track 1 */}
                      <div
                        onClick={() => setSelectedTrack("track_1")}
                        className={`p-3.5 rounded border cursor-pointer transition-all ${
                          selectedTrack === "track_1"
                            ? "bg-[#252526] border-[#007acc] shadow-sm ring-1 ring-[#007acc]/50"
                            : "bg-[#252526]/50 border-[#333333] hover:border-[#444444]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-meta font-mono text-[#007acc] px-2 py-0.5 bg-[#007acc]/10 rounded border border-[#007acc]/20">
                            FASE 1
                          </span>
                          <span className="text-meta text-[#858585]">12 Modul</span>
                        </div>
                        <h4 className="text-label font-semibold text-[#ffffff]">
                          Track 1: Fondasi Sintaks & Model Memori
                        </h4>
                        <p className="text-meta text-[#9d9d9d] mt-1 leading-relaxed">
                          Penguasaan Python CS50P, model memori objek (id, ref-count, mutability), OOP, pointer array, dan problem-solving kompetitif.
                        </p>
                      </div>

                      {/* Track 2 */}
                      <div
                        onClick={() => setSelectedTrack("track_2")}
                        className={`p-3.5 rounded border cursor-pointer transition-all ${
                          selectedTrack === "track_2"
                            ? "bg-[#252526] border-[#007acc] shadow-sm ring-1 ring-[#007acc]/50"
                            : "bg-[#252526]/50 border-[#333333] hover:border-[#444444]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-meta font-mono text-cyan-400 px-2 py-0.5 bg-cyan-950/40 rounded border border-cyan-800/40">
                            FASE 2
                          </span>
                          <span className="text-meta text-[#858585]">14 Modul</span>
                        </div>
                        <h4 className="text-label font-semibold text-[#ffffff]">
                          Track 2: Aljabar Linear Numerik & EDA
                        </h4>
                        <p className="text-meta text-[#9d9d9d] mt-1 leading-relaxed">
                          Vektorisasi array NumPy, operasi broadcasting, manipulasi DataFrame Pandas, aljabar matriks, dekomposisi SVD & PCA.
                        </p>
                      </div>

                      {/* Track 3 */}
                      <div
                        onClick={() => setSelectedTrack("track_3")}
                        className={`p-3.5 rounded border cursor-pointer transition-all ${
                          selectedTrack === "track_3"
                            ? "bg-[#252526] border-[#007acc] shadow-sm ring-1 ring-[#007acc]/50"
                            : "bg-[#252526]/50 border-[#333333] hover:border-[#444444]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-meta font-mono text-amber-400 px-2 py-0.5 bg-amber-950/40 rounded border border-amber-800/40">
                            FASE 3
                          </span>
                          <span className="text-meta text-[#858585]">10 Modul</span>
                        </div>
                        <h4 className="text-label font-semibold text-[#ffffff]">
                          Track 3: Optimasi & Machine Learning Klasik
                        </h4>
                        <p className="text-meta text-[#9d9d9d] mt-1 leading-relaxed">
                          Gradient Descent, Regresi Linier & Logistik, Regularisasi (L1/L2), SVM, Random Forest, XGBoost, dan evaluasi metrik OSN.
                        </p>
                      </div>

                      {/* Track 4 */}
                      <div
                        onClick={() => setSelectedTrack("track_4")}
                        className={`p-3.5 rounded border cursor-pointer transition-all ${
                          selectedTrack === "track_4"
                            ? "bg-[#252526] border-[#007acc] shadow-sm ring-1 ring-[#007acc]/50"
                            : "bg-[#252526]/50 border-[#333333] hover:border-[#444444]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-meta font-mono text-purple-400 px-2 py-0.5 bg-purple-950/40 rounded border border-purple-800/40">
                            FASE 4
                          </span>
                          <span className="text-meta text-[#858585]">10 Modul</span>
                        </div>
                        <h4 className="text-label font-semibold text-[#ffffff]">
                          Track 4: Deep Learning & Kompetisi IOAI
                        </h4>
                        <p className="text-meta text-[#9d9d9d] mt-1 leading-relaxed">
                          Autograd PyTorch, Multi-Layer Perceptron, CNN, Transformer, transfer learning, dan strategi submission kompetisi Kaggle.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: WORKSPACE ERGONOMICS */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-section-header font-semibold text-[#ffffff]">
                        Ergonomi & Fitur Produktivitas Workspace
                      </h3>
                      <p className="text-meta text-[#9d9d9d]">
                        Dirancang dengan estetika Dark Mode ala VS Code agar nyaman ditatap berjam-jam saat coding dan memecahkan soal matematika:
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3.5 bg-[#252526] border border-[#333333] rounded flex items-start space-x-3">
                        <Play className="w-5 h-5 text-[#007acc] shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="text-label font-semibold text-[#ffffff] block">
                            YouTube Player + Sinkronisasi Transkrip AI
                          </span>
                          <p className="text-meta text-[#9d9d9d] leading-relaxed">
                            Video materi YouTube dilengkapi kontrol mini-player dan tombol penarikan transkrip otomatis sehingga AI dapat membaca penjelasan dosen pada detik aktif.
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 bg-[#252526] border border-[#333333] rounded flex items-start space-x-3">
                        <Terminal className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="text-label font-semibold text-[#ffffff] block">
                            Eksekusi Cepat & Pintasan Keyboard
                          </span>
                          <div className="flex flex-wrap gap-2 text-meta font-mono pt-1">
                            <span className="px-2 py-1 bg-[#1e1e1e] border border-[#333333] rounded text-[#cccccc]">
                              <strong className="text-[#007acc]">Shift + Enter</strong> : Jalankan Sel Kode
                            </span>
                            <span className="px-2 py-1 bg-[#1e1e1e] border border-[#333333] rounded text-[#cccccc]">
                              <strong className="text-[#007acc]">Ctrl + B</strong> : Lipat/Buka Sidebar
                            </span>
                            <span className="px-2 py-1 bg-[#1e1e1e] border border-[#333333] rounded text-[#cccccc]">
                              <strong className="text-[#007acc]">Esc</strong> : Tutup Panel Modal
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 bg-[#252526] border border-[#333333] rounded flex items-start space-x-3">
                        <Bot className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="text-label font-semibold text-[#ffffff] block">
                            Socratic Mode Switcher
                          </span>
                          <p className="text-meta text-[#9d9d9d] leading-relaxed">
                            Beralih seketika antara <strong>Socratic Debugger</strong> (petunjuk dimensi & logika), <strong>Math-to-Code</strong> (terjemahan rumus LaTeX), dan <strong>EKKA OSN Examiner</strong> (latihan soal kompetisi).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: QUICK CONFIG & START */}
                {currentStep === 4 && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-950/40 border border-emerald-800/40 rounded text-emerald-400 text-meta font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sistem Siap Digunakan</span>
                      </div>
                      <h3 className="text-section-header font-semibold text-[#ffffff]">
                        Lingkungan Anda Telah Siap Sepenuhnya!
                      </h3>
                      <p className="text-meta text-[#9d9d9d] leading-relaxed">
                        Data pengguna telah diset bersih. Anda dapat langsung membuka materi belajar pertama, mengeksplorasi roadmap kurikulum, atau menghubungkan token Kaggle & Codeforces di panel Pengaturan.
                      </p>
                    </div>

                    <div className="p-4 bg-[#252526] border border-[#333333] rounded space-y-2 font-mono text-meta">
                      <div className="flex items-center justify-between text-[#cccccc]">
                        <span>• Engine AI (Google Gemini 3.6 Flash):</span>
                        <span className="text-emerald-400">ONLINE</span>
                      </div>
                      <div className="flex items-center justify-between text-[#cccccc]">
                        <span>• Komputasi Python Sandbox (Local Engine):</span>
                        <span className="text-emerald-400">READY</span>
                      </div>
                      <div className="flex items-center justify-between text-[#cccccc]">
                        <span>• Database SQLite (olympus.db):</span>
                        <span className="text-[#007acc]">ACTIVE (Clean State)</span>
                      </div>
                      <div className="flex items-center justify-between text-[#cccccc]">
                        <span>• Tema Antarmuka:</span>
                        <span className="text-[#cccccc]">VS Code Dark Gray (#181818 / #1e1e1e)</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Link href="/learn" className="flex-1" onClick={handleComplete}>
                        <MotionButton
                          className="w-full flex items-center justify-center space-x-2 px-5 py-3 bg-[#007acc] hover:bg-[#1f8ad2] text-white rounded font-medium text-label transition-colors shadow-md"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Mulai Belajar Sekarang</span>
                          <ArrowRight className="w-4 h-4" />
                        </MotionButton>
                      </Link>

                      <Link href="/roadmap" className="flex-1" onClick={handleComplete}>
                        <MotionButton
                          variant="secondary"
                          className="w-full flex items-center justify-center space-x-2 px-5 py-3 bg-[#252526] hover:bg-[#2d2d2d] border border-[#333333] text-[#cccccc] hover:text-[#ffffff] rounded font-medium text-label transition-colors"
                        >
                          <Compass className="w-4 h-4" />
                          <span>Lihat Roadmap Lengkap</span>
                        </MotionButton>
                      </Link>
                    </div>
                  </div>
                )}
              </AnimatedTabContent>
            </div>

            {/* Modal Bottom Controls */}
            <div className="h-14 bg-[#252526] border-t border-[#333333] px-6 flex items-center justify-between shrink-0">
              {currentStep > 1 ? (
                <MotionButton
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-meta text-[#cccccc] hover:text-[#ffffff] bg-[#1e1e1e] border border-[#333333] rounded hover:border-[#444444] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </MotionButton>
              ) : (
                <button
                  onClick={onClose}
                  className="text-meta text-[#858585] hover:text-[#cccccc] transition-colors"
                >
                  Lewati Panduan
                </button>
              )}

              <div className="flex items-center space-x-2">
                <span className="text-meta text-[#858585] font-mono mr-2">
                  Langkah {currentStep} dari 4
                </span>

                {currentStep < 4 ? (
                  <MotionButton
                    onClick={() => setCurrentStep((s) => s + 1)}
                    className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#007acc] hover:bg-[#1f8ad2] text-white rounded text-label font-medium transition-colors"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </MotionButton>
                ) : (
                  <MotionButton
                    onClick={handleComplete}
                    className="flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-label font-medium transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selesai</span>
                  </MotionButton>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
