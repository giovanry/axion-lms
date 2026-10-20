"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING_SNAPPY, SPRING_SMOOTH, SPRING_BOUNCY } from "@/lib/motion-config";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code,
  FileText,
  Layers,
  Sparkles,
  UploadCloud,
  Youtube,
} from "lucide-react";

interface GeneratedLesson {
  title: string;
  type: string;
  markdown_theory: string;
  math_bridge?: {
    concept_name: string;
    latex_formula: string;
    tensor_dimensions: string;
    python_vectorized_code: string;
    explanation: string;
  };
  starter_code?: string;
  test_assertions?: string;
}

interface GeneratedModule {
  id: string;
  title: string;
  track_id: string;
  track_title: string;
  description: string;
  level: string;
  lessons: GeneratedLesson[];
}

export default function ImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [targetTrack, setTargetTrack] = useState("track_2");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [generatedModule, setGeneratedModule] = useState<GeneratedModule | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorStatus(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile && !rawText.trim()) {
      setErrorStatus("Silakan unggah berkas materi (.pdf, .ipynb, .py, .md) atau ketik teks materi.");
      return;
    }

    setIsProcessing(true);
    setErrorStatus(null);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      if (rawText.trim()) {
        formData.append("raw_text", rawText.trim());
      }
      formData.append("target_track_id", targetTrack);
      if (youtubeUrl.trim()) {
        formData.append("youtube_url", youtubeUrl.trim());
      }
      if (customTitle.trim()) {
        formData.append("custom_title", customTitle.trim());
      }

      const res = await fetch("/api/v1/curriculum/ingest", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${res.status}`);
      }

      const data: GeneratedModule = await res.json();
      setGeneratedModule(data);
    } catch (err: any) {
      console.error("Ingest error:", err);
      setErrorStatus(err.message || "Gagal memproses dokumen dengan Gemini 3.6 Flash.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommit = async () => {
    if (!generatedModule) return;
    setIsCommitting(true);
    setErrorStatus(null);

    try {
      const res = await fetch("/api/v1/curriculum/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedModule),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan modul ke manifest kurikulum.");
      }

      router.push("/learn");
    } catch (err: any) {
      setErrorStatus(err.message || "Gagal melakukan commit kurikulum.");
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-root space-y-6 max-w-4xl mx-auto w-full">
      {/* Header Banner */}
      <div className="p-6 bg-surface border border-border-def rounded space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-meta text-primary font-mono px-2 py-0.5 bg-primary-muted rounded border border-primary/30">
            SMART DROPZONE
          </span>
          <span className="text-meta text-slate-400 font-mono">
            Powered by Google Gemini 3.6 Flash
          </span>
        </div>
        <h1 className="text-page-title text-slate-100 font-semibold text-lg">
          Ingest & Generate Modul Kurikulum AI
        </h1>
        <p className="text-body text-slate-300 max-w-2xl leading-relaxed">
          Unggah buku atau slide PDF, Jupyter Notebook (.ipynb), skrip Python, atau catatan Markdown.
          Gemini 3.6 Flash akan mengekstrak rumus matematika LaTeX, menyusun kartu Math-to-Code ($A = U \Sigma V^T$),
          dan merancang tantangan koding ber-Auto-Grader secara otomatis.
        </p>
      </div>

      {errorStatus && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-800/80 rounded text-rose-300 text-meta flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorStatus}</span>
        </div>
      )}

      {!generatedModule ? (
        <div className="space-y-5">
          {/* Track Selector with Shared Sliding Pill */}
          <div className="p-5 bg-surface border border-border-def rounded space-y-3">
            <label className="text-label text-slate-200 font-medium flex items-center space-x-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>Target Jalur Pembelajaran (Linear Track):</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-label font-mono relative">
              {[
                { id: "track_1", title: "Track 1: Sintaks & Memori", desc: "Fondasi Python, OOP & CS50P" },
                { id: "track_2", title: "Track 2: Aljabar Linear & EDA", desc: "NumPy, Pandas & Aljabar Matriks" },
                { id: "track_3", title: "Track 3: Optimasi & ML Klasik", desc: "Fungsi Rugi, Regresi & SVM" },
                { id: "track_4", title: "Track 4: Deep Learning & OSN", desc: "PyTorch, CNN & Persiapan Olimpiade" },
              ].map((t) => {
                const isSelected = targetTrack === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTargetTrack(t.id)}
                    className={`relative p-3 rounded border text-left transition-colors flex flex-col space-y-0.5 z-10 cursor-pointer ${
                      isSelected
                        ? "border-primary/60 text-slate-100"
                        : "border-border-def text-slate-400 hover:text-slate-200 hover:bg-root"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="import-track-pill"
                        className="absolute inset-0 bg-primary/20 rounded shadow-sm -z-10"
                        transition={SPRING_SNAPPY}
                      />
                    )}
                    <span className="font-semibold text-primary">{t.title}</span>
                    <span className="text-meta text-slate-400 font-sans">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drag & Drop File Container with Spring Bouncy Micro-Interaction */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.ipynb,.py,.md,.txt,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <motion.div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                setSelectedFile(e.dataTransfer.files[0]);
                setErrorStatus(null);
              }
            }}
            animate={{
              scale: isDragging ? 1.02 : 1,
            }}
            whileHover={{ scale: 1.01 }}
            transition={SPRING_BOUNCY}
            className={`p-8 rounded border-2 border-dashed flex flex-col items-center justify-center space-y-3 cursor-pointer transition-colors ${
              isDragging
                ? "border-primary bg-primary/10 shadow-lg"
                : "border-border-def hover:border-primary bg-surface/60"
            }`}
          >
            <motion.div
              animate={{ y: isDragging ? -4 : 0 }}
              transition={SPRING_BOUNCY}
              className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary"
            >
              <UploadCloud className="w-6 h-6" />
            </motion.div>

            <div className="text-center space-y-1">
              <div className="text-section-header font-medium text-slate-200">
                {selectedFile ? (
                  <span className="text-emerald-400 font-mono">
                    File Terpilih: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                ) : (
                  "Tarik & Jatuhkan file PDF, Notebook, Python, atau Markdown di sini"
                )}
              </div>
              <p className="text-meta text-slate-400">
                Mendukung format: <code className="text-primary font-mono">.pdf</code>,{" "}
                <code className="text-primary font-mono">.ipynb</code>,{" "}
                <code className="text-primary font-mono">.py</code>,{" "}
                <code className="text-primary font-mono">.md</code>,{" "}
                <code className="text-primary font-mono">.txt</code>
              </p>
            </div>
          </motion.div>

          {/* YouTube Video URL Field */}
          <div className="p-4 bg-surface border border-border-def rounded space-y-1.5">
            <label className="text-label text-slate-300 font-medium flex items-center space-x-2">
              <Youtube className="w-4 h-4 text-rose-500" />
              <span>Tautan Video YouTube Pendamping (Opsional):</span>
            </label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full bg-root border border-border-def rounded px-3 py-2 text-label font-mono text-slate-200 focus:outline-none focus:border-primary placeholder-slate-600"
            />
          </div>

          {/* Optional Raw Notes */}
          <div className="p-4 bg-surface border border-border-def rounded space-y-1.5">
            <label className="text-label text-slate-300 font-medium flex items-center space-x-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Catatan Tambahan atau Rumus Khusus (Opsional):</span>
            </label>
            <textarea
              rows={3}
              placeholder="Tempelkan ringkasan rumus matematika atau instruksi khusus untuk modul ini..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full bg-root border border-border-def rounded p-2.5 text-label font-sans text-slate-200 focus:outline-none focus:border-primary placeholder-slate-600 resize-none"
            />
          </div>

          {/* Generate Button with Spring Micro-Interaction */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={SPRING_SNAPPY}
              onClick={handleGenerate}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded text-label font-medium transition-colors shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? "Menganalisis Dokumen dengan Gemini..." : "Proses dengan Gemini 3.6 Flash"}</span>
            </motion.button>
          </div>
        </div>
      ) : (
        /* Rich Preview Screen of Generated Module */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-400 text-section-header font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              <span>Modul Berhasil Diformulasikan oleh Gemini 3.6 Flash</span>
            </div>
            <button
              onClick={() => setGeneratedModule(null)}
              className="text-label text-slate-400 hover:text-white underline"
            >
              Ganti Berkas
            </button>
          </div>

          <div className="p-5 rounded border border-border-def bg-surface space-y-4">
            <div className="space-y-1">
              <h2 className="text-page-title text-slate-100 font-semibold">{generatedModule.title}</h2>
              <div className="text-meta text-primary font-mono">
                {generatedModule.track_title} • Tingkat: {generatedModule.level}
              </div>
              <p className="text-body text-slate-300 pt-1 leading-relaxed">
                {generatedModule.description}
              </p>
            </div>

            <div className="pt-3 border-t border-border-def space-y-2.5">
              <div className="text-label font-semibold text-slate-200">
                Daftar Sub-Modul Interaktif ({generatedModule.lessons.length} Pelajaran):
              </div>
              {generatedModule.lessons.map((les, i) => (
                <div key={i} className="p-3 rounded bg-elevated border border-border-def space-y-1.5 text-label">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-100 flex items-center space-x-2">
                      {les.type === "CODING" ? (
                        <Code className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                      )}
                      <span>{i + 1}. {les.title}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-root text-slate-400 border border-border-def">
                      {les.type}
                    </span>
                  </div>

                  {les.math_bridge && (
                    <div className="text-meta text-slate-400 font-mono">
                      Rumus Kunci: <code className="text-sky-300">{les.math_bridge.latex_formula}</code>
                    </div>
                  )}

                  {les.test_assertions && (
                    <div className="text-[11px] text-emerald-400 font-mono">
                      Auto-Grader: Assertions unit test siap dievaluasi
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-meta text-slate-500 font-mono">
              Integrasi Non-Destruktif ke curriculum.json
            </span>

            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={SPRING_SNAPPY}
                onClick={() => setGeneratedModule(null)}
                className="px-4 py-2 bg-elevated hover:bg-root border border-border-def rounded text-label font-medium text-slate-300 transition-colors cursor-pointer"
              >
                Batal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={SPRING_SNAPPY}
                onClick={handleCommit}
                disabled={isCommitting}
                className="flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-label font-medium transition-colors shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCommitting ? "Menyimpan ke Kurikulum..." : "Simpan ke Kurikulum Axion"}</span>
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
