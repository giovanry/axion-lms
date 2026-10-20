"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Table,
  LineChart,
  Terminal,
  Send,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";
import { useAxionStore } from "@/stores/useAxionStore";

// Dynamically import Monaco Editor to avoid SSR window issues
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center font-mono text-[12px] text-zinc-500 bg-zinc-950">
      Memuat Axion Monaco Editor...
    </div>
  ),
});

export const Zona3NotebookSandbox: React.FC = () => {
  const {
    activeLesson,
    activeLessonId,
    lastExecutionResult,
    updateExecutionResult,
    addChatMessage,
    userProfile,
    setUserProfile,
    toggleAiPanel,
    setIsAiThinking,
  } = useAxionStore();

  const [code, setCode] = useState(
    activeLesson?.starter_code ||
      `import numpy as np

# Modul 2.1: Perkalian Matriks NumPy & Vektorisasi
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])
C = A @ B
C`
  );

  const [outputTab, setOutputTab] = useState<"DATAFRAME" | "STDOUT" | "PLOT">("DATAFRAME");
  const [executionCount, setExecutionCount] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [stdout, setStdout] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dataframeData, setDataframeData] = useState<any>(null);
  const [plotImage, setPlotImage] = useState<string | null>(null);
  const [passedAllAsserts, setPassedAllAsserts] = useState(false);

  // Sync starter_code on lesson change
  useEffect(() => {
    if (activeLesson?.starter_code) {
      setCode(activeLesson.starter_code);
      setPassedAllAsserts(false);
      setErrorMessage(null);
    }
  }, [activeLesson]);

  // Execute Code (Run: Shift+Enter)
  const handleExecute = async (isSubmission = false) => {
    setIsRunning(true);
    setErrorMessage(null);
    if (!isSubmission) setPassedAllAsserts(false);

    try {
      const res = await fetch("/api/v1/notebook/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: activeLessonId || "default_session",
          code,
          test_assertions: isSubmission ? activeLesson?.test_assertions : null,
          reset_session: false,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setExecutionCount((prev) => prev + 1);
      setStdout(data.stdout || "");

      if (data.dataframe) {
        setDataframeData(data.dataframe);
        setOutputTab("DATAFRAME");
      } else if (data.plot_base64) {
        setPlotImage(data.plot_base64);
        setOutputTab("PLOT");
      } else {
        setOutputTab("STDOUT");
      }

      if (data.success) {
        if (isSubmission && data.passed_asserts) {
          setPassedAllAsserts(true);
          updateExecutionResult({
            status: "PASSED",
            message: "Seluruh pengujian unit test assert berhasil dilewati! (+4 Poin Kesiapan EKKA OSN)",
          });
          setUserProfile({
            osnReadinessScore: Math.min(100, userProfile.osnReadinessScore + 4),
          });
        } else {
          updateExecutionResult({
            status: "SUCCESS",
            message: `Eksekusi selesai dalam ${data.execution_time_ms}ms`,
          });
        }
      } else {
        setErrorMessage(data.error_message || data.stderr || "Terjadi kesalahan saat eksekusi.");
        updateExecutionResult({
          status: "ERROR",
          message: data.error_message || "Execution error",
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menghubungi kernel eksekusi Python.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleRestartKernel = async () => {
    try {
      await fetch(`/api/v1/notebook/reset/${activeLessonId || "default_session"}`, {
        method: "POST",
      });
      setStdout("");
      setErrorMessage(null);
      setDataframeData(null);
      setPlotImage(null);
      setPassedAllAsserts(false);
      updateExecutionResult({
        status: "IDLE",
        message: "Kernel namespace telah di-reset bersih.",
      });
    } catch (e) {
      console.warn("Failed to reset kernel", e);
    }
  };

  const handleSendErrorToSocratic = async () => {
    const errorText = errorMessage || "Runtime Error";
    addChatMessage({
      sender: "user",
      text: `Saya mengalami error berikut saat menjalankan sel: "${errorText}". Tolong bimbing logika saya untuk memperbaikinya tanpa memberikan jawaban kode utuh.`,
    });
    toggleAiPanel(true);
    setIsAiThinking(true);
    try {
      const res = await fetch("/api/v1/ai/socratic-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Saya mengalami error berikut: "${errorText}". Bantu bimbing saya menemukan penyebabnya secara bertahap.`,
          mode: "SOCRATIC_DEBUGGER",
          lesson_id: activeLessonId,
          lesson_title: activeLesson?.title,
          track_title: activeLesson?.track_title,
          active_code: code,
          error_traceback: errorText,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        addChatMessage({
          sender: data.provider === "ollama" ? "ollama" : "gemini",
          text: data.reply,
          isHint: true,
        });
      }
    } catch (e) {
      console.warn("Failed to query socratic tutor:", e);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleTriggerSocraticHint = async () => {
    toggleAiPanel(true);
    setIsAiThinking(true);
    try {
      const res = await fetch("/api/v1/ai/socratic-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Berikan 1 petunjuk konseptual Socratic untuk menyelesaikan tantangan "${activeLesson?.title || 'ini'}" tanpa memberikan kodenya.`,
          mode: "SOCRATIC_DEBUGGER",
          lesson_id: activeLessonId,
          lesson_title: activeLesson?.title,
          track_title: activeLesson?.track_title,
          active_code: code,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        addChatMessage({
          sender: data.provider === "ollama" ? "ollama" : "gemini",
          text: data.reply,
          isHint: true,
        });
      }
    } catch (e) {
      console.warn("Failed to get socratic hint:", e);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 border-r border-zinc-800/80 overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-9 px-3 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[12px] font-medium text-zinc-200">
            Stateful Python Sandbox & Auto-Grader
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
            Python 3.11 Stateful
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleRestartKernel}
            title="Restart Kernel Namespace"
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleTriggerSocraticHint}
            title="Minta Petunjuk Logika Socratic (Tanpa Spoiler)"
            className="flex items-center space-x-1 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors"
          >
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Socratic Hint</span>
          </button>

          {/* Run Code Button */}
          <button
            onClick={() => handleExecute(false)}
            disabled={isRunning}
            title="Jalankan Sel Kode (Shift+Enter)"
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-[11px] font-medium transition-colors border border-zinc-700"
          >
            <Play className="w-3 h-3 text-indigo-400 fill-indigo-400" />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>

          {/* Submit Solution Button */}
          <button
            onClick={() => handleExecute(true)}
            disabled={isRunning}
            title="Kirim Solusi ke Auto-Grader Uji Assert (Ctrl+Enter)"
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-medium transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Code Editor Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Cell Header Badge */}
        <div className="h-7 px-3 bg-zinc-900 border-b border-zinc-800/80 flex items-center justify-between text-[11px] font-mono shrink-0">
          <div className="flex items-center space-x-2 text-zinc-400">
            <span className="text-indigo-400 font-semibold">In [{executionCount}]</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-500 truncate max-w-[180px]">
              {activeLesson?.id || "matrix_sandbox"}.py
            </span>
          </div>

          <div className="text-[10px] text-zinc-500">
            Shift+Enter to Run • Ctrl+Enter to Submit Solution
          </div>
        </div>

        {/* Monaco Editor Container */}
        <div className="flex-1 min-h-[220px] bg-zinc-950">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 12.5,
              fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
              lineNumbers: "on",
              renderLineHighlight: "all",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              cursorBlinking: "smooth",
              padding: { top: 8, bottom: 8 },
            }}
          />
        </div>
      </div>

      {/* Output & Visual Canvas Section */}
      <div className="h-64 border-t border-zinc-800/80 bg-zinc-950 flex flex-col shrink-0">
        {/* Output Header Tabs */}
        <div className="h-8 px-3 bg-zinc-900/80 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-1 text-[11px]">
            <button
              onClick={() => setOutputTab("DATAFRAME")}
              className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded font-medium transition-colors ${
                outputTab === "DATAFRAME"
                  ? "bg-zinc-800 text-indigo-300 border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Table className="w-3 h-3" />
              <span>DataFrame / Matriks</span>
            </button>

            <button
              onClick={() => setOutputTab("STDOUT")}
              className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded font-medium transition-colors ${
                outputTab === "STDOUT"
                  ? "bg-zinc-800 text-indigo-300 border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Terminal className="w-3 h-3" />
              <span>Console (stdout)</span>
            </button>

            <button
              onClick={() => setOutputTab("PLOT")}
              className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded font-medium transition-colors ${
                outputTab === "PLOT"
                  ? "bg-zinc-800 text-indigo-300 border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <LineChart className="w-3 h-3" />
              <span>Plot Canvas</span>
            </button>
          </div>

          {/* Passed Assert Badge */}
          {passedAllAsserts && (
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
              <CheckCircle2 className="w-3 h-3" />
              <span>All Assertions Passed (+4 OSN pts)</span>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-3 overflow-y-auto">
          {/* Smart Traceback Box if Error Occurs */}
          {errorMessage && (
            <div className="mb-3 p-3 rounded border border-rose-500/40 bg-rose-950/20 text-rose-200 text-[11.5px] space-y-2">
              <div className="flex items-center justify-between font-mono font-semibold text-rose-400">
                <span className="flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Smart Traceback Parser</span>
                </span>
                <span className="text-[10px] text-zinc-500">Python Exception</span>
              </div>
              <pre className="font-mono text-[11px] text-rose-300/90 whitespace-pre-wrap overflow-x-auto">
                {errorMessage}
              </pre>
              <button
                onClick={handleSendErrorToSocratic}
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded bg-rose-600/30 hover:bg-rose-600/40 border border-rose-500/40 text-rose-200 font-medium text-[11px] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-300" />
                <span>Bimbing Saya Perbaiki Error Ini dengan Socratic AI (Zona 4)</span>
                <ArrowRight className="w-3 h-3 text-rose-300" />
              </button>
            </div>
          )}

          {outputTab === "DATAFRAME" && (
            <div className="space-y-2">
              {dataframeData ? (
                <>
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>
                      Dimensi: {dataframeData.shape[0]} baris × {dataframeData.shape[1]} kolom
                    </span>
                    <span>Tipe Data: Matriks / DataFrame</span>
                  </div>

                  <div className="rounded border border-zinc-800 overflow-x-auto">
                    <table className="w-full text-[11px] font-mono text-left">
                      <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 sticky top-0">
                        <tr>
                          <th className="p-2 border-r border-zinc-800 text-zinc-600">#</th>
                          {dataframeData.columns.map((col: any) => (
                            <th
                              key={col.name}
                              className="p-2 border-r border-zinc-800 last:border-r-0"
                            >
                              <div>{col.name}</div>
                              <div className="text-[9px] text-zinc-500 font-normal">
                                {col.type}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/60 text-zinc-200">
                        {dataframeData.rows.map((row: any[], idx: number) => (
                          <tr key={idx} className="hover:bg-zinc-900/40">
                            <td className="p-2 border-r border-zinc-800 text-zinc-600">{idx}</td>
                            {row.map((val: any, cellIdx: number) => (
                              <td
                                key={cellIdx}
                                className="p-2 border-r border-zinc-800/60 last:border-r-0"
                              >
                                {val !== null ? String(val) : "NaN"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 font-mono text-[11px]">
                  Evaluasikan variabel DataFrame atau array NumPy di baris terakhir untuk melihat tabel interaktif.
                </div>
              )}
            </div>
          )}

          {outputTab === "STDOUT" && (
            <div className="font-mono text-[11.5px] text-zinc-300 space-y-1">
              <div className="text-zinc-500">
                [Out {executionCount}] Eksekusi kernel Python:
              </div>
              <pre className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800/80 text-emerald-400 whitespace-pre-wrap">
                {stdout || "(Tidak ada output konsol standar)"}
              </pre>
            </div>
          )}

          {outputTab === "PLOT" && (
            <div className="h-full flex items-center justify-center p-2">
              {plotImage ? (
                <img
                  src={plotImage}
                  alt="Hasil Visualisasi Matplotlib"
                  className="max-h-52 object-contain rounded border border-zinc-800 bg-white"
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1 text-zinc-500 text-[11px]">
                  <LineChart className="w-8 h-8 text-zinc-600 stroke-1" />
                  <span>Belum ada visualisasi plot aktif. Panggil plt.plot() & plt.show().</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
