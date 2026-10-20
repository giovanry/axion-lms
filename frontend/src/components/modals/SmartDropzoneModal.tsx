"use client";

import React, { useRef, useState } from "react";
import {
  X,
  UploadCloud,
  FileText,
  Youtube,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Layers,
  ArrowRight,
  Code,
  BookOpen,
} from "lucide-react";
import { useAxionStore } from "@/stores/useAxionStore";

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

export const SmartDropzoneModal: React.FC = () => {
  const { isSmartDropzoneOpen, setSmartDropzoneOpen, addChatMessage, setCurriculum } = useAxionStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [targetTrack, setTargetTrack] = useState("track_2");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [generatedModule, setGeneratedModule] = useState<GeneratedModule | null>(null);

  if (!isSmartDropzoneOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorStatus(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile && !rawText.trim()) {
      setErrorStatus("Silakan pilih file (.pdf, .ipynb, .py, .md) atau ketik teks materi.");
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
      setErrorStatus(err.message || "Gagal memproses dokumen dengan Gemini AI.");
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

      // Refresh curriculum tree
      const treeRes = await fetch("/api/v1/curriculum/tree");
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        setCurriculum(treeData);
      }

      addChatMessage({
        sender: "system",
        text: `Modul '${generatedModule.title}' berhasil diintegrasikan ke ${generatedModule.track_title}. Siap dipelajari di Zona 1!`,
      });

      setGeneratedModule(null);
      setSelectedFile(null);
      setRawText("");
      setSmartDropzoneOpen(false);
    } catch (err: any) {
      setErrorStatus(err.message || "Gagal melakukan commit kurikulum.");
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-[13px] font-semibold text-zinc-100">
              Smart Dropzone — Ingest Dokumen ke Kurikulum AI
            </span>
          </div>

          <button
            onClick={() => setSmartDropzoneOpen(false)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {errorStatus && (
            <div className="p-3 rounded bg-rose-950/30 border border-rose-500/40 text-[11px] text-rose-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorStatus}</span>
            </div>
          )}

          {!generatedModule ? (
            <>
              {/* Target Track Selector */}
              <div className="space-y-1.5">
                <label className="text-[11.5px] font-medium text-zinc-300 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Target Jalur Pembelajaran (Linear Track):</span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {[
                    { id: "track_1", title: "Track 1: Sintaks & Memori" },
                    { id: "track_2", title: "Track 2: Aljabar Linear & Pandas" },
                    { id: "track_3", title: "Track 3: Optimasi & ML Klasik" },
                    { id: "track_4", title: "Track 4: Deep Learning & Vision/NLP" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTargetTrack(t.id)}
                      className={`p-2 rounded border text-left transition-colors ${
                        targetTrack === t.id
                          ? "bg-indigo-600/20 border-indigo-500/60 text-indigo-200"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                      }`}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dropzone Container */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.ipynb,.py,.md,.txt,.csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setSelectedFile(e.dataTransfer.files[0]);
                    setErrorStatus(null);
                  }
                }}
                className="p-6 rounded-lg border-2 border-dashed border-zinc-700 hover:border-indigo-500 bg-zinc-900/30 flex flex-col items-center justify-center space-y-2 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <UploadCloud className="w-5 h-5" />
                </div>

                <div className="text-center space-y-1">
                  <div className="text-[12.5px] font-medium text-zinc-200">
                    {selectedFile ? (
                      <span className="text-emerald-400 font-mono">
                        File Terpilih: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    ) : (
                      "Tarik & Jatuhkan file PDF / Notebook / Python / Markdown di sini"
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Atau klik untuk memilih file dari komputer Anda
                  </div>
                </div>
              </div>

              {/* YouTube Link Field */}
              <div className="space-y-1.5">
                <label className="text-[11.5px] font-medium text-zinc-300 flex items-center space-x-1.5">
                  <Youtube className="w-3.5 h-3.5 text-rose-500" />
                  <span>Tautan Video YouTube Pendamping (Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-[12px] font-mono text-zinc-200 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                />
              </div>

              {/* Optional Custom Notes / Text */}
              <div className="space-y-1.5">
                <label className="text-[11.5px] font-medium text-zinc-300 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Catatan Tambahan atau Teks Teori (Opsional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Tempelkan ringkasan rumus matematika atau instruksi khusus untuk modul ini..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-[11px] font-sans text-zinc-200 focus:outline-none focus:border-indigo-500 placeholder-zinc-600 resize-none"
                />
              </div>
            </>
          ) : (
            /* Rich Preview Screen of Generated Module */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400 text-[12.5px] font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Modul Berhasil Diformulasikan oleh Gemini 3.6 Flash</span>
                </div>
                <button
                  onClick={() => setGeneratedModule(null)}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 underline"
                >
                  Ganti File
                </button>
              </div>

              <div className="p-3.5 rounded border border-zinc-800 bg-zinc-900/60 space-y-2.5">
                <div>
                  <div className="text-[13px] font-semibold text-zinc-100">
                    {generatedModule.title}
                  </div>
                  <div className="text-[11px] text-indigo-400 font-mono">
                    {generatedModule.track_title} • Tingkat: {generatedModule.level}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {generatedModule.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800 space-y-2">
                  <div className="text-[11px] font-semibold text-zinc-300">
                    Daftar Sub-Modul Interaktif ({generatedModule.lessons.length} Pelajaran):
                  </div>
                  {generatedModule.lessons.map((les, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-zinc-950 border border-zinc-800/80 space-y-1 text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-zinc-200 flex items-center space-x-1.5">
                          {les.type === "CODING" ? (
                            <Code className="w-3 h-3 text-amber-400" />
                          ) : (
                            <BookOpen className="w-3 h-3 text-indigo-400" />
                          )}
                          <span>{i + 1}. {les.title}</span>
                        </span>
                        <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400">
                          {les.type}
                        </span>
                      </div>
                      {les.math_bridge && (
                        <div className="text-[10px] text-zinc-400 font-mono">
                          Rumus: <code className="text-indigo-300">{les.math_bridge.latex_formula}</code>
                        </div>
                      )}
                      {les.test_assertions && (
                        <div className="text-[9.5px] text-emerald-400/90 font-mono">
                          Auto-Grader: Assertions siap diverifikasi
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500 font-mono">
            {isProcessing ? "Menghubungi Gemini 3.6 Flash..." : "Non-Destructive Merge: Aktif"}
          </div>

          <div className="flex items-center space-x-2">
            {!generatedModule ? (
              <button
                onClick={handleGenerate}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[12px] font-medium transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isProcessing ? "Menganalisis Dokumen..." : "Proses dengan Gemini"}</span>
              </button>
            ) : (
              <button
                onClick={handleCommit}
                disabled={isCommitting}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[12px] font-medium transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isCommitting ? "Menyimpan ke Kurikulum..." : "Simpan ke Kurikulum Axion"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
