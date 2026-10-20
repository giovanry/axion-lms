"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Cpu,
  Database,
  Layers,
  Menu,
  Trophy,
  X,
  CheckCircle2,
  ChevronDown,
  Copy,
  Check,
  Terminal,
  Activity,
  Network,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import {
  SPRING_SNAPPY,
  SPRING_SMOOTH,
  SPRING_GENTLE,
  EASE_OUT_EXPO,
} from "@/lib/motion-config";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"math" | "cp" | "ai">("math");
  const [copiedCode, setCopiedCode] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Detect scroll for sticky header elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const copySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const mathCode = `# Track 2: Gradient Descent & Loss Computation
import numpy as np

def compute_loss_and_gradients(X, y, weights):
    """
    Menghitung binary cross-entropy loss dan gradien bobot.
    L(w) = - (1/N) * sum(y * log(p) + (1-y) * log(1-p))
    """
    n_samples = X.shape[0]
    linear_output = np.dot(X, weights)
    predictions = 1 / (1 + np.exp(-linear_output))
    
    # Hitung gradien vektor
    errors = predictions - y
    gradients = (1 / n_samples) * np.dot(X.T, errors)
    return predictions, gradients`;

  const cpCode = `# Track 1: Competitive Programming (Prefix Sum)
def max_subarray_sum(nums: list[int], k: int) -> int:
    """
    Mencari jumlah subarray maksimum berukuran k.
    Kompleksitas Waktu: O(N)
    Kompleksitas Memori: O(1)
    """
    current_sum = sum(nums[:k])
    max_sum = current_sum
    
    for i in range(k, len(nums)):
        current_sum += nums[i] - nums[i - k]
        if current_sum > max_sum:
            max_sum = current_sum
            
    return max_sum

# Test kasus uji lokal
assert max_subarray_sum([2, 1, 5, 1, 3, 2], 3) == 9
assert max_subarray_sum([1, 4, 2, 10, 23, 3, 1, 0, 20], 4) == 39
print("Semua kasus uji lolos.")`;

  const aiSnippet = `# Sesi Asistensi Kurikulum AI Lokal (Ollama Engine)
# Prompt Siswa:
"Jelaskan mengapa fungsi aktivasi ReLU lebih disukai daripada Sigmoid
pada hidden layer jaringan saraf tiruan dalam komputasi backpropagation?"

# Respons Model (Llama 3 / Qwen):
"Keunggulan utama ReLU: f(x) = max(0, x) terletak pada turunan parsialnya.
Pada region positif (x > 0), turunannya konstan = 1.
Hal ini mencegah fenomena Vanishing Gradient yang terjadi pada Sigmoid,
di mana turunan maksimumnya hanya 0.25 dan mendekati 0 untuk nilai input besar.
Selain itu, komputasi max(0, x) tidak memerlukan operasi eksponensial,
sehingga jauh lebih efisien pada pelatihan model skala besar."`;

  const faqs = [
    {
      q: "Apakah Axion dapat digunakan sepenuhnya secara offline?",
      a: "Ya. Seluruh runtime kode Python dieksekusi langsung oleh backend FastAPI di komputer lokal Anda. Kurikulum, bank soal, dan riwayat belajar tersimpan di database SQLite lokal. Jika Anda mengaktifkan Ollama di localhost, asisten pembelajaran juga beroperasi tanpa internet.",
    },
    {
      q: "Bagaimana keamanan kredensial token API Kaggle?",
      a: "Kredensial API Kaggle disimpan secara lokal di mesin Anda dan hanya digunakan untuk mengunduh dataset resmi dari server Kaggle saat diminta. Kredensial tidak pernah dikirim ke pihak ketiga.",
    },
    {
      q: "Apakah materi mencakup silabus Olimpiade Sains Nasional Kecerdasan Artifisial (OSN AI)?",
      a: "Ya. Kurikulum dirancang bertahap mencakup komputasi Python berkinerja tinggi, aljabar linear vektor dan matriks, optimasi kalkulus, machine learning klasik, hingga evaluasi arsitektur jaringan saraf tiruan.",
    },
    {
      q: "Berapa spesifikasi perangkat keras minimum yang dibutuhkan?",
      a: "Spesifikasi minimum: Prosesor dual-core, RAM 4 GB, dan instalasi Python 3.10+. Untuk menjalankan model bahasa lokal Ollama (seperti Llama 3 8B), disarankan memiliki RAM 16 GB atau GPU dengan minimal 6 GB VRAM.",
    },
  ];

  // Motion variants for container and children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemFadeUp = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: SPRING_SMOOTH,
    },
  };

  return (
    <div className="relative w-full bg-root text-slate-100 flex flex-col min-h-screen selection:bg-primary/30 selection:text-white">
      {/* Animated Computational Graph Canvas Background */}
      <AnimatedBackground />

      {/* Sticky Header with Dynamic Elevation & Blur */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={SPRING_SNAPPY}
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#181818]/92 backdrop-blur-md border-b border-[#333333] shadow-md shadow-black/30"
            : "bg-[#181818]/70 backdrop-blur-sm border-b border-[#333333]/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo with Interactive Spring Hover */}
          <Link
            href="/"
            className="flex items-center space-x-2.5 text-slate-100 hover:text-white transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded py-1 px-1.5"
          >
            <motion.div
              whileHover={{ scale: 1.08, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              transition={SPRING_SNAPPY}
              className="w-8 h-8 rounded bg-primary/15 border border-primary/50 flex items-center justify-center text-primary font-mono font-bold text-sm shadow-sm"
            >
              A
            </motion.div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-tight text-slate-100 text-sm">AXION</span>
              <span className="text-[10px] text-primary font-mono px-1.5 py-0.5 border border-primary/40 rounded bg-primary/10">
                LMS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Animated Underline Micro-Interaction */}
          <nav className="hidden md:flex items-center space-x-6 text-body">
            {[
              { label: "Kurikulum", href: "#kurikulum" },
              { label: "Fitur Workspace", href: "#fitur" },
              { label: "Arsitektur Lokal", href: "#arsitektur" },
              { label: "Tanya Jawab", href: "#faq" },
            ].map((navItem) => (
              <motion.a
                key={navItem.label}
                href={navItem.href}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                className="text-slate-300 hover:text-white transition-colors text-label font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-2.5 py-1.5"
              >
                {navItem.label}
              </motion.a>
            ))}
          </nav>

          {/* Desktop Right Action Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={SPRING_SNAPPY}>
              <Link
                href="/dashboard"
                className="px-3.5 py-2 text-slate-300 hover:text-white border border-[#475569] rounded hover:bg-elevated transition-colors text-label font-medium min-h-[44px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Buka Dashboard
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={SPRING_SNAPPY}>
              <Link
                href="/learn"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded font-medium text-label transition-colors min-h-[44px] flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
              >
                <span>Mulai Belajar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-elevated rounded border border-[#475569] min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Mobile Dropdown Drawer with Framer Motion AnimatePresence */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
              className="md:hidden overflow-hidden px-4 pt-3 pb-6 border-t border-[#333333] bg-[#1e1e1e]/98 backdrop-blur-lg space-y-3 shadow-xl"
            >
              <nav className="flex flex-col space-y-2">
                {[
                  { label: "Kurikulum", href: "#kurikulum" },
                  { label: "Fitur Workspace", href: "#fitur" },
                  { label: "Arsitektur Lokal", href: "#arsitektur" },
                  { label: "Tanya Jawab", href: "#faq" },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2.5 text-slate-200 hover:bg-elevated rounded text-body font-medium min-h-[44px] flex items-center transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="pt-2 border-t border-[#333333] flex flex-col space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-4 py-2.5 text-center text-slate-200 border border-[#475569] rounded hover:bg-elevated font-medium text-body min-h-[44px] flex items-center justify-center transition-colors"
                >
                  Buka Dashboard Siswa
                </Link>
                <Link
                  href="/learn"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-4 py-2.5 text-center bg-primary hover:bg-primary-hover text-white rounded font-medium text-body min-h-[44px] flex items-center justify-center space-x-2 transition-colors"
                >
                  <span>Mulai Belajar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#333333]/70 max-w-7xl mx-auto w-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl space-y-6"
          >
            {/* Status Indicator Badge */}
            <motion.div
              variants={itemFadeUp}
              className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-surface/90 border border-[#475569] shadow-sm backdrop-blur-sm"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-meta font-mono font-medium text-slate-300">
                LOCAL DESKTOP RUNTIME : OFFLINE-READY
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemFadeUp}
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-100 leading-tight"
            >
              Platform Belajar Mandiri: Python, Matematika AI, dan Data Science
            </motion.h1>

            {/* Value Proposition Subheading */}
            <motion.p
              variants={itemFadeUp}
              className="text-body sm:text-base text-slate-300 leading-relaxed"
            >
              Dirancang khusus untuk persiapan kompetisi OSN Kecerdasan Artifisial dan competitive programming.
              Berjalan langsung di mesin lokal Anda dengan editor Monaco, visualisasi rumus KaTeX, sandbox eksekusi
              Python terisolasi, dan asistensi model bahasa offline via Ollama.
            </motion.p>

            {/* Action CTAs with Spring Physics */}
            <motion.div
              variants={itemFadeUp}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={SPRING_SNAPPY}>
                <Link
                  href="/learn"
                  className="px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded font-medium text-body transition-colors min-h-[44px] flex items-center justify-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-lg shadow-primary/20"
                >
                  <span>Mulai Jalur Belajar</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={SPRING_SNAPPY}>
                <Link
                  href="/dashboard"
                  className="px-5 py-3 bg-surface hover:bg-elevated text-slate-200 border border-[#475569] rounded font-medium text-body transition-colors min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
                >
                  Masuk ke Dashboard
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={SPRING_SNAPPY}>
                <Link
                  href="/playground"
                  className="px-5 py-3 bg-surface hover:bg-elevated text-slate-200 border border-[#475569] rounded font-medium text-body transition-colors min-h-[44px] flex items-center justify-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
                >
                  <Code2 className="w-4 h-4 text-primary" />
                  <span>Playground CP</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Technical Specification Badges Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={SPRING_SMOOTH}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-[#333333]/80"
          >
            {[
              {
                tag: "EKSEKUSI LOKAL",
                title: "Zero Cloud Latency",
                desc: "Kode dieksekusi langsung di runtime Python lokal melalui worker FastAPI berkecepatan tinggi.",
              },
              {
                tag: "4 JALUR KURIKULUM",
                title: "Sintaks Hingga Deep Learning",
                desc: "Struktur materi bertahap dari dasar pemrograman hingga kalkulus turunan dan arsitektur model AI.",
              },
              {
                tag: "INTEGRASI RESMI",
                title: "Kaggle & Codeforces",
                desc: "Akses dataset publik langsung dan pantau riwayat penyelesaian soal algoritma secara terpusat.",
              },
              {
                tag: "AI OFFLINE TUTOR",
                title: "Dukungan Ollama",
                desc: "Konsultasi pemahaman materi dengan model bahasa lokal di komputer Anda tanpa internet.",
              },
            ].map((spec, idx) => (
              <motion.div
                key={spec.tag}
                whileHover={{ y: -4, borderColor: "rgba(0, 122, 204, 0.55)" }}
                transition={SPRING_SNAPPY}
                className="p-4 bg-surface/90 border border-[#333333] rounded space-y-1.5 backdrop-blur-sm transition-colors"
              >
                <div className="text-meta font-mono text-primary font-semibold">{spec.tag}</div>
                <div className="text-section-header text-slate-100 font-semibold">{spec.title}</div>
                <p className="text-label text-slate-400 leading-normal">{spec.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Interactive Workspace Preview Section with Framer Motion LayoutId */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto w-full space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={SPRING_SMOOTH}
            className="space-y-2"
          >
            <div className="text-meta font-mono text-primary font-semibold uppercase tracking-wider">
              INTERACTIVE WORKSPACE DEMO
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Pratinjau Ruang Kerja & Pembelajaran Interaktif
            </h2>
            <p className="text-body text-slate-300 max-w-2xl">
              Pilih kapabilitas di bawah untuk melihat bagaimana Axion menyajikan materi teori matematika, editor kode
              Monaco, dan kasus uji otomatis.
            </p>
          </motion.div>

          {/* Animated Tab Selector with Sliding Pill */}
          <div className="flex flex-wrap gap-2 border-b border-[#333333] pb-2">
            {[
              { id: "math" as const, label: "Matematika KaTeX & NumPy", icon: BookOpen },
              { id: "cp" as const, label: "Competitive Programming Runner", icon: Code2 },
              { id: "ai" as const, label: "Tutor AI Offline (Ollama)", icon: Cpu },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded text-label font-medium transition-colors min-h-[44px] flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive ? "text-white" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-primary rounded shadow-sm"
                      transition={SPRING_SNAPPY}
                    />
                  )}
                  <span className="relative z-10 flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Code & Theory Showcase Box with Smooth Motion Container */}
          <motion.div
            layout
            transition={SPRING_SMOOTH}
            className="bg-surface/95 border border-[#333333] rounded-lg overflow-hidden shadow-xl backdrop-blur-sm"
          >
            {/* Header Bar */}
            <div className="h-11 px-4 bg-[#252526] border-b border-[#333333] flex items-center justify-between text-meta font-mono text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#3e3e3e]" />
                <span className="w-3 h-3 rounded-full bg-[#3e3e3e]" />
                <span className="w-3 h-3 rounded-full bg-[#3e3e3e]" />
                <span className="ml-2 text-slate-400">
                  {activeTab === "math"
                    ? "gradient_descent_loss.py"
                    : activeTab === "cp"
                    ? "prefix_sum_competitive.py"
                    : "ollama_assistant_session.txt"}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={SPRING_SNAPPY}
                onClick={() =>
                  copySnippet(
                    activeTab === "math" ? mathCode : activeTab === "cp" ? cpCode : aiSnippet
                  )
                }
                aria-label="Salin potongan kode ke clipboard"
                className="flex items-center space-x-1.5 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-[#333333] rounded transition-colors min-h-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-sans">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-sans">Salin Kode</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Dynamic Content Area with AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Left Context / Explanation */}
                <div className="lg:col-span-5 space-y-4 text-body text-slate-300">
                  {activeTab === "math" && (
                    <div className="space-y-3">
                      <h3 className="text-section-header text-slate-100 font-semibold">
                        Koneksi Matematika ke Implementasi Kode
                      </h3>
                      <p className="text-body text-slate-300 leading-relaxed">
                        Setiap pelajaran matematika di Axion menyajikan rumus turunan parsial berdampingan dengan
                        implementasi matriks NumPy. Siswa tidak hanya menghafal rumus, tetapi langsung memahami bagaimana
                        vektor dot product bekerja secara komputasional.
                      </p>
                      <div className="p-3 bg-root border border-[#333333] rounded font-mono text-meta text-primary space-y-1">
                        <div>Gradien Bobot: dL/dw = (1/N) * X.T @ (y_pred - y)</div>
                        <div>Pembaruan Parameter: w = w - alpha * (dL/dw)</div>
                      </div>
                      <div className="pt-2">
                        <Link
                          href="/learn?lesson=math_01_vector"
                          className="inline-flex items-center space-x-1.5 text-label font-medium text-primary hover:underline min-h-[44px]"
                        >
                          <span>Pelajari Modul Aljabar Linear & Kalkulus</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {activeTab === "cp" && (
                    <div className="space-y-3">
                      <h3 className="text-section-header text-slate-100 font-semibold">
                        Evaluasi Algoritma Kompetitif Real-Time
                      </h3>
                      <p className="text-body text-slate-300 leading-relaxed">
                        Runner kasus uji lokal memeriksa solusi Anda terhadap ragam masukan ekstrem dan batasan kompleksitas
                        waktu O(N). Dilengkapi terjemahan soal kompetisi Codeforces ke Bahasa Indonesia.
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2 text-label text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Kasus Uji 1: n=6, k=3 (Lolos dalam 0.01s)</span>
                        </div>
                        <div className="flex items-center space-x-2 text-label text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Kasus Uji 2: n=9, k=4 (Lolos dalam 0.01s)</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Link
                          href="/playground"
                          className="inline-flex items-center space-x-1.5 text-label font-medium text-primary hover:underline min-h-[44px]"
                        >
                          <span>Buka Playground Competitive Programming</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {activeTab === "ai" && (
                    <div className="space-y-3">
                      <h3 className="text-section-header text-slate-100 font-semibold">
                        Asistensi Teori Berbasis Model Offline
                      </h3>
                      <p className="text-body text-slate-300 leading-relaxed">
                        Ditenagai integrasi Ollama lokal. Siswa dapat menanyakan konsep rumit seperti backpropagation,
                        regularisasi L2, atau visualisasi tensor tanpa memerlukan token cloud atau koneksi internet aktif.
                      </p>
                      <div className="p-3 bg-root border border-[#333333] rounded text-meta space-y-1">
                        <div className="text-slate-400">Daemon: Ollama v0.1.x (Localhost:11434)</div>
                        <div className="text-slate-400">Model Default: Llama 3 8B / Qwen 2.5 Coder</div>
                      </div>
                      <div className="pt-2">
                        <Link
                          href="/dashboard"
                          className="inline-flex items-center space-x-1.5 text-label font-medium text-primary hover:underline min-h-[44px]"
                        >
                          <span>Kelola Pengaturan AI di Dashboard</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Code Display with Clean Monaco-Style Line Blocks */}
                <div className="lg:col-span-7 bg-root border border-[#333333] rounded p-4 font-mono text-label overflow-x-auto text-slate-200 shadow-inner">
                  <pre className="leading-relaxed">
                    <code>{activeTab === "math" ? mathCode : activeTab === "cp" ? cpCode : aiSnippet}</code>
                  </pre>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Curriculum Tracks Section */}
        <section id="kurikulum" className="px-4 sm:px-6 lg:px-8 py-16 bg-[#181818]/85 border-t border-[#333333] backdrop-blur-sm">
          <div className="max-w-7xl mx-auto space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={SPRING_SMOOTH}
              className="space-y-2"
            >
              <div className="text-meta font-mono text-primary font-semibold uppercase tracking-wider">
                STRUCTURED LEARNING PATHS
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
                4 Jalur Kurikulum Terstruktur
              </h2>
              <p className="text-body text-slate-300 max-w-2xl">
                Kurikulum bertahap yang mengombinasikan konsep matematika rigor dengan implementasi kode langsung untuk
                membangun pemahaman mendalam.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  track: "TRACK 1",
                  title: "Dasar Python & Algoritma",
                  desc: "Model memori objek Python, struktur data (list, dict, set, deque), teknik rekursi, dan analisis kompleksitas Big-O.",
                  lesson: "py_01_syntax",
                },
                {
                  track: "TRACK 2",
                  title: "Aljabar Linear & Kalkulus",
                  desc: "Operasi vektor dan tensor, dot product, turunan parsial, rantai turunan (chain rule), dan optimasi gradient descent secara matematis.",
                  lesson: "math_01_vector",
                },
                {
                  track: "TRACK 3",
                  title: "Machine Learning Klasik",
                  desc: "Pemrosesan array NumPy, manipulasi DataFrame Pandas, regresi linier/logistik, decision tree, dan pencatatan metrik evaluasi F1-Score.",
                  lesson: "ml_01_numpy",
                },
                {
                  track: "TRACK 4",
                  title: "Jaringan Saraf Tiruan & OSN",
                  desc: "Forward propagation, fungsi aktivasi nonlinear, penurunan gradien backward pass manual, serta bank soal persiapan OSN AI.",
                  lesson: "dl_01_perceptron",
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.track}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...SPRING_SMOOTH, delay: idx * 0.08 }}
                  whileHover={{ y: -6, borderColor: "rgba(0, 122, 204, 0.6)" }}
                  className="p-5 bg-surface/90 border border-[#333333] rounded-lg flex flex-col justify-between space-y-4 transition-colors shadow-sm"
                >
                  <div className="space-y-2.5">
                    <span className="text-meta font-mono text-primary px-2 py-0.5 bg-primary/10 rounded border border-primary/30 inline-block">
                      {item.track}
                    </span>
                    <h3 className="text-section-header text-slate-100 font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-label text-slate-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <Link
                    href={`/learn?lesson=${item.lesson}`}
                    className="inline-flex items-center justify-between text-label font-medium text-slate-200 hover:text-white pt-3 border-t border-[#333333] min-h-[44px] group"
                  >
                    <span>Buka Materi {item.track}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Detail Section */}
        <section id="fitur" className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto w-full space-y-10 border-t border-[#333333]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={SPRING_SMOOTH}
            className="space-y-2"
          >
            <div className="text-meta font-mono text-primary font-semibold uppercase tracking-wider">
              ENGINEERING CAPABILITIES
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Fitur Utama Workspace Axion
            </h2>
            <p className="text-body text-slate-300 max-w-2xl">
              Semua fungsi dibuat untuk menunjang alur belajar teknis tanpa hambatan konfigurasi lingkungan yang rumit.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Layers,
                title: "Split Screen Bersebelahan",
                desc: "Panel teori di sisi kiri menyajikan teks, bagan alir, dan rumus KaTeX. Panel kanan memuat editor Monaco lengkap dengan autosave, penomoran baris, dan eksekusi konsol langsung.",
              },
              {
                icon: Code2,
                title: "Playground Competitive Programming",
                desc: "Latihan soal algoritma dari platform Codeforces yang dilengkapi terjemahan bahasa Indonesia dan runner kasus uji otomatis untuk menguji batas waktu dan memori kode.",
              },
              {
                icon: Database,
                title: "Integrasi Dataset Kaggle",
                desc: "Cari dan unduh dataset publik Kaggle langsung dari dalam aplikasi. Kode inisialisasi eksplorasi data (EDA) dibuat otomatis sehingga Anda dapat langsung menganalisis data.",
              },
              {
                icon: Trophy,
                title: "Papan Peringkat Model Lokal",
                desc: "Gunakan dekorator @lms_track_accuracy pada skrip latihan Anda. Parameter model, metrik akurasi, dan durasi pelatihan otomatis tercatat di papan peringkat lokal.",
              },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...SPRING_SMOOTH, delay: idx * 0.08 }}
                  whileHover={{ y: -4, borderColor: "rgba(0, 122, 204, 0.55)" }}
                  className="p-6 bg-surface/90 border border-[#333333] rounded-lg space-y-3 transition-colors shadow-sm"
                >
                  <div className="flex items-center space-x-3 text-primary">
                    <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={SPRING_SNAPPY}>
                      <Icon className="w-5 h-5" />
                    </motion.div>
                    <h3 className="text-section-header text-slate-100 font-semibold">
                      {feat.title}
                    </h3>
                  </div>
                  <p className="text-body text-slate-300 leading-relaxed">
                    {feat.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Architecture Section with Interactive Flow Line */}
        <section id="arsitektur" className="px-4 sm:px-6 lg:px-8 py-16 bg-[#181818]/85 border-t border-[#333333] backdrop-blur-sm">
          <div className="max-w-7xl mx-auto space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={SPRING_SMOOTH}
              className="space-y-2"
            >
              <div className="text-meta font-mono text-primary font-semibold uppercase tracking-wider">
                SYSTEM ARCHITECTURE
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
                Arsitektur Lokal & Kedaulatan Data
              </h2>
              <p className="text-body text-slate-300 max-w-2xl">
                Axion dibangun dengan prinsip local-first. Progres belajar, kode latihan, dan dataset Anda tetap berada di
                komputer Anda.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={SPRING_SMOOTH}
              className="p-6 bg-surface/90 border border-[#333333] rounded-lg space-y-6 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ x: 3 }}
                  transition={SPRING_SNAPPY}
                  className="space-y-2 border-l-2 border-primary pl-4"
                >
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-primary" />
                    <div className="text-section-header text-slate-100 font-semibold">
                      1. Antarmuka Web (Next.js 14)
                    </div>
                  </div>
                  <p className="text-label text-slate-300 leading-relaxed">
                    Menggunakan Tailwind CSS dan komponen Monaco Editor. Menyajikan navigasi cepat dan rendering rumus
                    matematika berbasis KaTeX tanpa latency.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ x: 3 }}
                  transition={SPRING_SNAPPY}
                  className="space-y-2 border-l-2 border-primary pl-4"
                >
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <div className="text-section-header text-slate-100 font-semibold">
                      2. Backend Sandbox (FastAPI)
                    </div>
                  </div>
                  <p className="text-label text-slate-300 leading-relaxed">
                    Menyediakan endpoint eksekusi Python terisolasi, manajemen database SQLite lokal, dan jembatan ke
                    runtime lokal komputer Anda.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ x: 3 }}
                  transition={SPRING_SNAPPY}
                  className="space-y-2 border-l-2 border-primary pl-4"
                >
                  <div className="flex items-center space-x-2">
                    <Network className="w-4 h-4 text-primary" />
                    <div className="text-section-header text-slate-100 font-semibold">
                      3. Mesin Inferensi AI (Ollama)
                    </div>
                  </div>
                  <p className="text-label text-slate-300 leading-relaxed">
                    Daemon lokal yang melayani inferensi model bahasa offline di localhost:11434 untuk menjawab pertanyaan
                    kurikulum tanpa ketergantungan API pihak ketiga.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section with Framer Motion Accordion Transitions */}
        <section id="faq" className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto w-full space-y-8 border-t border-[#333333]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={SPRING_SMOOTH}
            className="space-y-2"
          >
            <div className="text-meta font-mono text-primary font-semibold uppercase tracking-wider">
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-body text-slate-300 max-w-2xl">
              Informasi praktis seputar implementasi teknis dan alur penggunaan platform Axion.
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-surface/90 border border-[#333333] rounded-lg overflow-hidden transition-colors shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="w-full px-5 py-4 text-left flex items-center justify-between space-x-4 text-slate-100 hover:text-white font-medium text-body min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span>{faq.q}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={SPRING_SNAPPY}
                      className="shrink-0"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-colors ${
                          isOpen ? "text-primary" : "text-slate-400"
                        }`}
                      />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 text-slate-300 text-label leading-relaxed border-t border-[#333333]/50 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Action Banner Closing with Subtle Shimmer Glow */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-[#1e1e1e]/90 border-t border-[#333333] relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={SPRING_SMOOTH}
              className="text-2xl sm:text-3xl font-bold text-slate-100"
            >
              Siap Memulai Persiapan OSN AI & Pemrograman Kompetitif?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={SPRING_SMOOTH}
              className="text-body text-slate-300 max-w-xl mx-auto leading-relaxed"
            >
              Mulai dari pelajaran pertama untuk memahami struktur memori Python, atau buka dashboard untuk melanjutkan
              progres belajar yang telah tersimpan.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={SPRING_SMOOTH}
              className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} transition={SPRING_SNAPPY}>
                <Link
                  href="/learn"
                  className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded font-medium text-body transition-colors min-h-[44px] flex items-center justify-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-lg shadow-primary/25"
                >
                  <span>Mulai Belajar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} transition={SPRING_SNAPPY}>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-6 py-3 bg-root hover:bg-elevated text-slate-200 border border-[#475569] rounded font-medium text-body transition-colors min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
                >
                  Buka Dashboard Siswa
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Real Functional Footer */}
      <footer className="relative z-10 px-4 sm:px-6 lg:px-8 py-10 bg-[#181818] border-t border-[#333333] text-meta">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2 text-slate-300">
            <div className="w-6 h-6 rounded bg-primary/10 border border-primary/50 flex items-center justify-center text-primary font-mono font-bold text-xs">
              A
            </div>
            <span className="font-semibold text-slate-200">AXION LMS</span>
            <span className="text-slate-400">| Sistem Pembelajaran Mandiri AI & Python</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Belajar", href: "/learn" },
              { label: "Playground CP", href: "/playground" },
              { label: "Datasets", href: "/datasets" },
              { label: "Leaderboard", href: "/leaderboard" },
              { label: "Roadmap", href: "/roadmap" },
            ].map((link, idx) => (
              <React.Fragment key={link.href}>
                {idx > 0 && <span className="text-slate-600">•</span>}
                <Link
                  href={link.href}
                  className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1 min-h-[32px] flex items-center"
                >
                  {link.label}
                </Link>
              </React.Fragment>
            ))}
          </div>

          <div className="text-slate-400">
            Local SQLite : FastAPI Backend : Port 8000
          </div>
        </div>
      </footer>
    </div>
  );
}
