"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  Video,
  FileText,
  Clock,
  Sparkles,
  BookmarkPlus,
  ChevronUp,
  ChevronDown,
  Minimize2,
  Maximize2,
  Layers,
  Terminal,
} from "lucide-react";
import { useAxionStore } from "@/stores/useAxionStore";
import { MathBridgeCard } from "@/components/common/MathBridgeCard";

export const Zona2TheoryAndVideo: React.FC = () => {
  const { activeLesson, isVideoMiniPlayer, setIsVideoMiniPlayer, addChatMessage } =
    useAxionStore();

  const [isPullingTranscript, setIsPullingTranscript] = useState(false);
  const [videoCollapsed, setVideoCollapsed] = useState(false);
  const [isScrolledPastVideo, setIsScrolledPastVideo] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Monitor scroll position to trigger Floating Mini-Player
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const top = scrollContainerRef.current.scrollTop;
      setIsScrolledPastVideo(top > 260);
    }
  };

  const videoUrl =
    activeLesson?.video_url || "https://www.youtube.com/embed/QUT1VHiLmmI";

  const handlePullTranscript = async () => {
    setIsPullingTranscript(true);
    try {
      const res = await fetch("/api/v1/ai/youtube-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url: videoUrl }),
      });
      const data = await res.json();
      if (data.success) {
        addChatMessage({
          sender: "system",
          text: `Transkrip untuk modul '${activeLesson?.title || "Perkalian Matriks"}' (${data.total_segments || 0} segmen) berhasil ditarik dan disuntikkan ke memori Gemini 3.6 Flash. Anda dapat bertanya mengenai detik mana pun pada video.`,
        });
      } else {
        addChatMessage({
          sender: "system",
          text: `Pemberitahuan Transkrip: ${data.error || "Transkrip tidak tersedia untuk video ini."}`,
        });
      }
    } catch (err: any) {
      addChatMessage({
        sender: "system",
        text: `Gagal menarik transkrip: ${err.message}`,
      });
    } finally {
      setIsPullingTranscript(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 border-r border-zinc-800/80 overflow-hidden relative">
      {/* Top Header */}
      <div className="h-9 px-3 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 truncate">
          <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-[12px] font-medium text-zinc-200 truncate">
            {activeLesson?.title || "Teori & Smart YouTube Player"}
          </span>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => setVideoCollapsed(!videoCollapsed)}
            title={videoCollapsed ? "Buka Pemutar Video" : "Sembunyikan Video"}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          >
            {videoCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Dockable YouTube Theatre (16:9) */}
      {!videoCollapsed && (
        <div className="shrink-0 bg-zinc-950 border-b border-zinc-800/80 p-3">
          <div className="relative aspect-video w-full rounded overflow-hidden border border-zinc-800 bg-black shadow-inner">
            <iframe
              src={videoUrl}
              title="YouTube video player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Controls Below Video */}
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePullTranscript}
                disabled={isPullingTranscript}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-medium transition-colors"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>
                  {isPullingTranscript ? "Menarik Transkrip..." : "Tarik Transkrip ke AI"}
                </span>
              </button>

              <button
                onClick={() =>
                  addChatMessage({
                    sender: "system",
                    text: "Detik video berhasil ditandai sebagai bookmark belajar pribadi.",
                  })
                }
                title="Tandai momen penting ini"
                className="flex items-center space-x-1 px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <BookmarkPlus className="w-3 h-3" />
                <span>+ Detik Ini</span>
              </button>
            </div>

            <span className="font-mono text-[10px] text-zinc-500 truncate max-w-[150px]">
              {videoUrl.split("/").pop()}
            </span>
          </div>
        </div>
      )}

      {/* Floating Mini-Player on Deep Scroll */}
      {videoCollapsed || isScrolledPastVideo ? (
        <div className="absolute top-12 right-4 z-20 w-64 rounded-md overflow-hidden border border-indigo-500/40 bg-black shadow-2xl transition-all">
          <div className="h-5 px-2 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-[9px] font-mono text-zinc-400">
            <span>Mini-Player</span>
            <button
              onClick={() => {
                setVideoCollapsed(false);
                setIsScrolledPastVideo(false);
              }}
              className="text-zinc-400 hover:text-white"
            >
              <Maximize2 className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="aspect-video w-full">
            <iframe
              src={videoUrl}
              title="Mini YouTube player"
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media"
            />
          </div>
        </div>
      ) : null}

      {/* Interactive Theory Area with Markdown & KaTeX */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Module Header Badges */}
        <div className="space-y-1.5 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold">
              {activeLesson?.track_title?.split(":")[0] || "TRACK 2"}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
              EKKA OSN CURRICULUM
            </span>
          </div>
          <h1 className="text-[16px] font-semibold text-zinc-100 tracking-tight">
            {activeLesson?.title || "2.1 Perkalian Matriks NumPy & Broadcasting"}
          </h1>
          <p className="text-[13px] text-zinc-400 leading-relaxed">
            Menghubungkan aljabar linear formal ke dalam efisiensi komputasi array multidimensi Python
            tanpa perulangan loop lambat.
          </p>
        </div>

        {/* Dynamic Markdown or Fallback Rich Theory */}
        {activeLesson?.markdown_content ? (
          <div className="prose prose-invert prose-zinc max-w-none text-[13px] leading-relaxed space-y-3">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {activeLesson.markdown_content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="space-y-3 text-[13px] text-zinc-300 leading-relaxed">
            <h2 className="text-[14px] font-semibold text-zinc-100">
              1. Definisi Formal Perkalian Matriks
            </h2>
            <p>
              Diberikan dua matriks {"$\\mathbf{A} \\in \\mathbb{R}^{m \\times k}$"} dan{" "}
              {"$\\mathbf{B} \\in \\mathbb{R}^{k \\times n}$"}. Hasil kali kedua matriks menghasilkan
              matriks baru {"$\\mathbf{C} = \\mathbf{A}\\mathbf{B} \\in \\mathbb{R}^{m \\times n}$"}{" "}
              di mana setiap elemen baris $i$ dan kolom $j$ dihitung melalui penjumlahan perkalian
              pasangan elemen (*dot product*):
            </p>
            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-center text-zinc-200">
              {"$$C_{ij} = \\sum_{p=1}^{k} A_{ip} B_{pj}$$"}
            </div>
            <p className="text-zinc-400 text-[12px]">
              Perhatikan syarat kompatibilitas dimensi: Jumlah kolom matriks pertama ($k$) harus sama
              persis dengan jumlah baris matriks kedua ($k$).
            </p>
          </div>
        )}

        {/* Interactive Math-to-Code Bridges */}
        <MathBridgeCard
          conceptName="Perkalian Matriks (Matrix Dot Product)"
          latexFormula="C_{ij} = \sum_{p=1}^k A_{ip} B_{pj} \implies \mathbf{C} = \mathbf{A} \mathbf{B}"
          tensorDimensions="A(m, k) × B(k, n) -> C(m, n)"
          pythonCode={`import numpy as np

A = np.array([[1, 2], [3, 4]])  # (2, 2)
B = np.array([[5, 6], [7, 8]])  # (2, 2)

# Cara modern dan paling cepat (Python 3.5+):
C = A @ B  
# Atau ekuivalen: C = np.matmul(A, B)`}
          explanation="Operator @ pada Python memanggil pustaka BLAS (Basic Linear Algebra Subprograms) yang dioptimasi pada tingkat hardware CPU/GPU."
        />

        <MathBridgeCard
          conceptName="Normalisasi Fitur (Z-Score Standardization)"
          latexFormula="Z = \frac{X - \mu}{\sigma}, \quad \mu = \frac{1}{m}\sum_{i=1}^m x_i"
          tensorDimensions="X(m, n) - μ(1, n) -> Z(m, n)"
          pythonCode={`# Normalisasi matriks fitur ke mean=0 dan std=1
mean = X.mean(axis=0)       # Vektor rata-rata (n,)
std = X.std(axis=0) + 1e-8  # Vektor simpangan baku (n,)
Z = (X - mean) / std        # Penyiaran otomatis tanpa loop`}
          explanation="NumPy secara implisit memperluas dimensi vektor mean dari (n,) menjadi (1, n) agar selaras dengan dimensi X (m, n)."
        />
      </div>
    </div>
  );
};
