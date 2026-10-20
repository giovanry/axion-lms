"use client";

import React, { useEffect, useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING_SNAPPY, SPRING_SMOOTH, SPRING_BOUNCY } from "@/lib/motion-config";
import { ActiveTabPill, AnimatedTabContent, ShakeBox } from "@/components/ui/motion-primitives";
import {
  AlertCircle,
  BarChart3,
  Check,
  CheckCircle2,
  Copy,
  Database,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Table,
  Terminal,
  Trash2,
} from "lucide-react";
import { useLmsStore } from "@/stores/useLmsStore";

interface MonacoWorkspaceProps {
  initialCode?: string;
  testAssertions?: string;
  onExecutionSuccess?: () => void;
}

type OutputTab = "STDOUT" | "DATAFRAME" | "PLOT";

export const MonacoWorkspace: React.FC<MonacoWorkspaceProps> = ({
  initialCode = "# Tuliskan solusi Python Anda di sini\n",
  testAssertions,
  onExecutionSuccess,
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeOutputTab, setActiveOutputTab] = useState<OutputTab>("STDOUT");

  const [output, setOutput] = useState<{
    stdout: string;
    stderr: string;
    passed: boolean;
    timeMs: number;
    error?: string;
    dataframe?: {
      columns: string[];
      data: any[][];
      shape: [number, number];
    } | null;
    plotBase64?: string | null;
  } | null>(null);

  const editorRef = useRef<any>(null);
  const { setAiContext, toggleAiDrawer, userStats, setUserStats, activeLessonId, activeLesson } = useLmsStore();

  useEffect(() => {
    setCode(initialCode || "");
    setOutput(null);
  }, [initialCode]);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.editor.defineTheme("olympusDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "64748b", fontStyle: "italic" },
        { token: "keyword", foreground: "38bdf8", fontStyle: "bold" },
        { token: "string", foreground: "34d399" },
        { token: "number", foreground: "f472b6" },
        { token: "function", foreground: "60a5fa" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#d4d4d4",
        "editorCursor.foreground": "#aeafad",
        "editor.lineHighlightBackground": "#282828",
        "editorLineNumber.foreground": "#858585",
        "editorLineNumber.activeForeground": "#c6c6c6",
        "editor.selectionBackground": "#264f78",
      },
    });
    monaco.editor.setTheme("olympusDark");

    // Keybindings:
    // Ctrl+Enter / Cmd+Enter: Submit Solution with Auto-Grader
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleExecuteCode(true);
    });

    // Shift+Enter: Run code (interactive exploratory)
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      handleExecuteCode(false);
    });
  };

  const handleExecuteCode = async (isSubmission: boolean = false) => {
    setIsRunning(true);
    const currentCode = editorRef.current ? editorRef.current.getValue() : code;
    const sessionId = activeLessonId || "default_session";

    try {
      const res = await fetch("/api/v1/notebook/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          code: currentCode,
          test_assertions: isSubmission ? testAssertions : null,
          timeout_seconds: 12,
        }),
      });

      if (!res.ok) throw new Error("Gagal mengeksekusi kode pada stateful kernel backend.");
      const data = await res.json();

      setOutput({
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        passed: !!data.passed_asserts,
        timeMs: data.execution_time_ms || 0,
        error: data.error_message || (data.stderr ? "Runtime Error" : undefined),
        dataframe: data.dataframe_preview || null,
        plotBase64: data.plot_base64 || null,
      });

      // Switch active tab based on output type
      if (data.dataframe_preview) {
        setActiveOutputTab("DATAFRAME");
      } else if (data.plot_base64) {
        setActiveOutputTab("PLOT");
      } else {
        setActiveOutputTab("STDOUT");
      }

      if (isSubmission && data.passed_asserts) {
        if (onExecutionSuccess) onExecutionSuccess();
        if (userStats) {
          setUserStats({
            ...userStats,
            osn_readiness_score: Math.min(100, (userStats.osn_readiness_score || 50) + 4),
          });
        }
      }
    } catch (err: any) {
      setOutput({
        stdout: "",
        stderr: err.message || "Eksekusi kode gagal.",
        passed: false,
        timeMs: 0,
        error: err.message,
      });
      setActiveOutputTab("STDOUT");
    } finally {
      setIsRunning(false);
    }
  };

  const handleRestartKernel = async () => {
    const sessionId = activeLessonId || "default_session";
    try {
      await fetch(`/api/v1/notebook/reset/${sessionId}`, { method: "POST" });
      setOutput({
        stdout: "✓ Kernel session namespace berhasil di-reset bersih.",
        stderr: "",
        passed: true,
        timeMs: 0,
      });
      setActiveOutputTab("STDOUT");
    } catch {
      // ignore
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAskAi = () => {
    if (!output) return;
    toggleAiDrawer(true);
    setAiContext({
      code,
      errorOutput: output.stderr || output.error || "Pemeriksaan assertion gagal.",
      title: activeLesson?.title || "Debugging Tantangan Python",
    });
  };

  return (
    <div className="h-full flex flex-col bg-surface border-l border-border-def overflow-hidden">
      {/* Action Header */}
      <div className="h-10 px-3 bg-elevated border-b border-border-def flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-label font-mono text-slate-300">Stateful Python Kernel</span>
          <span className="text-meta text-slate-500 hidden sm:inline font-mono">
            (Shift+Enter: Run | Ctrl+Enter: Submit)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={SPRING_SNAPPY}
            onClick={handleCopyCode}
            className="flex items-center space-x-1 px-2 py-1 bg-surface hover:bg-elevated border border-border-def rounded text-label text-slate-400 hover:text-slate-200 transition-colors"
            title="Salin kode"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{isCopied ? "Tersalin" : "Salin"}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={SPRING_SNAPPY}
            onClick={handleRestartKernel}
            className="flex items-center space-x-1 px-2 py-1 bg-surface hover:bg-elevated border border-border-def rounded text-label text-slate-400 hover:text-slate-200 transition-colors group"
            title="Reset memori kernel"
          >
            <RotateCcw className="w-3 h-3 group-hover:-rotate-90 transition-transform" />
            <span className="hidden sm:inline">Reset Kernel</span>
          </motion.button>

          {/* Run Button (Exploratory) */}
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            transition={SPRING_SNAPPY}
            onClick={() => handleExecuteCode(false)}
            disabled={isRunning}
            className="flex items-center space-x-1 px-2.5 py-1 bg-elevated hover:bg-root border border-border-def text-slate-200 hover:text-white rounded text-label font-medium transition-colors disabled:opacity-50"
            title="Jalankan kode tanpa unit test (Shift+Enter)"
          >
            <motion.div
              whileHover={{ scale: 1.25 }}
              transition={SPRING_SNAPPY}
            >
              <Play className="w-3 h-3 text-primary fill-current" />
            </motion.div>
            <span>{isRunning ? "..." : "Run"}</span>
          </motion.button>

          {/* Submit Solution Button (Auto-Grader) */}
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            transition={SPRING_SNAPPY}
            onClick={() => handleExecuteCode(true)}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-3 py-1 bg-primary hover:bg-primary-hover text-white rounded text-label font-medium transition-colors disabled:opacity-50 shadow-sm"
            title="Uji solusi dengan Auto-Grader (Ctrl+Enter)"
          >
            <motion.div
              animate={isRunning ? { rotate: 360 } : { rotate: 0 }}
              transition={isRunning ? { repeat: Infinity, duration: 1, ease: "linear" } : SPRING_SNAPPY}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </motion.div>
            <span>Submit Solusi</span>
          </motion.button>
        </div>
      </div>

      {/* Monaco Code Editor Container */}
      <div className="flex-1 min-h-0 relative border-b border-border-def">
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={(val) => setCode(val || "")}
          onMount={handleEditorMount}
          loading={
            <div className="h-full flex items-center justify-center font-mono text-label text-slate-500">
              Memuat Monaco Editor...
            </div>
          }
          options={{
            fontSize: 13,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 8, bottom: 8 },
            renderLineHighlight: "all",
          }}
        />
      </div>

      {/* Output Console Panel with Sub-Tabs */}
      <div className="h-52 bg-root flex flex-col shrink-0">
        {/* Sub-Tabs Header */}
        <div className="px-3 py-1.5 bg-elevated border-b border-border-def flex items-center justify-between text-meta text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-surface p-0.5 rounded border border-border-def relative">
              <button
                onClick={() => setActiveOutputTab("STDOUT")}
                className={`relative flex items-center space-x-1 px-2 py-0.5 rounded font-mono text-[11px] transition-colors z-10 ${
                  activeOutputTab === "STDOUT"
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {activeOutputTab === "STDOUT" && (
                  <ActiveTabPill layoutId="monaco-output-subtab-pill" />
                )}
                <Terminal className="w-3 h-3" />
                <span>Terminal</span>
              </button>

              <button
                onClick={() => setActiveOutputTab("DATAFRAME")}
                className={`relative flex items-center space-x-1 px-2 py-0.5 rounded font-mono text-[11px] transition-colors z-10 ${
                  activeOutputTab === "DATAFRAME"
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {activeOutputTab === "DATAFRAME" && (
                  <ActiveTabPill layoutId="monaco-output-subtab-pill" />
                )}
                <Table className="w-3 h-3" />
                <span>DataFrame {output?.dataframe ? "✓" : ""}</span>
              </button>

              <button
                onClick={() => setActiveOutputTab("PLOT")}
                className={`relative flex items-center space-x-1 px-2 py-0.5 rounded font-mono text-[11px] transition-colors z-10 ${
                  activeOutputTab === "PLOT"
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {activeOutputTab === "PLOT" && (
                  <ActiveTabPill layoutId="monaco-output-subtab-pill" />
                )}
                <BarChart3 className="w-3 h-3" />
                <span>Plot {output?.plotBase64 ? "✓" : ""}</span>
              </button>
            </div>

            {output && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={SPRING_BOUNCY}
                className={`px-1.5 py-0.5 rounded font-mono text-meta ${
                  output.passed
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                    : "bg-rose-950 text-rose-400 border border-rose-800/50"
                }`}
              >
                {output.passed ? "PASSED (+4 OSN)" : "FAILED"}
              </motion.span>
            )}
            {output && <span>({output.timeMs} ms)</span>}
          </div>

          <div className="flex items-center space-x-2">
            {output && (
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                transition={SPRING_SNAPPY}
                onClick={() => setOutput(null)}
                className="text-slate-500 hover:text-slate-300"
                title="Bersihkan output"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            )}

            {output && !output.passed && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={SPRING_SNAPPY}
                onClick={handleAskAi}
                className="flex items-center space-x-1 text-primary hover:text-primary-hover transition-colors font-medium text-meta"
              >
                <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Bimbing Socratic AI</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Sub-Tab Content Viewers with AnimatedTabContent */}
        <div className="flex-1 p-3 overflow-y-auto font-mono text-label text-slate-300 space-y-2">
          {!output && !isRunning && (
            <span className="text-slate-500 italic block">
              Gunakan "Run" untuk eksperimen atau "Submit Solusi" untuk evaluasi otomatis Auto-Grader.
            </span>
          )}

          {isRunning && (
            <span className="text-primary animate-pulse block">
              Mengeksekusi kode pada stateful Python kernel...
            </span>
          )}

          <AnimatedTabContent tabKey={activeOutputTab}>
            {output && activeOutputTab === "STDOUT" && (
              <div className="space-y-2">
                {output.stdout && <pre className="whitespace-pre-wrap text-slate-200">{output.stdout}</pre>}
                
                {/* Smart Traceback Box with 1-click trigger to Socratic AI and ShakeBox on Error */}
                {output.stderr && (
                  <ShakeBox triggerKey={output.stderr}>
                    <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded space-y-2">
                      <div className="flex items-center justify-between text-rose-300 text-meta">
                        <span className="font-semibold flex items-center space-x-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Runtime Error / Traceback</span>
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          transition={SPRING_SNAPPY}
                          onClick={handleAskAi}
                          className="px-2 py-0.5 rounded bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700/60 transition-colors"
                        >
                          Bimbing dengan Socratic AI ↗
                        </motion.button>
                      </div>
                      <pre className="whitespace-pre-wrap text-rose-300 text-[11px] leading-relaxed">
                        {output.stderr}
                      </pre>
                    </div>
                  </ShakeBox>
                )}
              </div>
            )}

            {output && activeOutputTab === "DATAFRAME" && (
              <div>
                {output.dataframe ? (
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-slate-400 font-mono">
                      Bentuk Matriks/Tabel: {output.dataframe.shape[0]} baris × {output.dataframe.shape[1]} kolom
                    </div>
                    <div className="max-h-36 overflow-auto border border-border-def rounded bg-surface">
                      <table className="w-full text-left text-[11px] font-mono">
                        <thead className="bg-elevated border-b border-border-def sticky top-0">
                          <tr>
                            {output.dataframe.columns.map((c, idx) => (
                              <th key={idx} className="p-1.5 font-semibold text-slate-200 border-r border-border-def last:border-r-0">
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {output.dataframe.data.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-border-def/40 hover:bg-root/50">
                              {row.map((val, cIdx) => (
                                <td key={cIdx} className="p-1.5 text-slate-300 border-r border-border-def/30 last:border-r-0">
                                  {String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 italic">Tidak ada objek DataFrame pada baris evaluasi terakhir.</div>
                )}
              </div>
            )}

            {output && activeOutputTab === "PLOT" && (
              <div>
                {output.plotBase64 ? (
                  <div className="flex flex-col items-center p-2 bg-surface border border-border-def rounded">
                    <img
                      src={`data:image/png;base64,${output.plotBase64}`}
                      alt="Matplotlib Canvas"
                      className="max-h-36 rounded object-contain"
                    />
                    <span className="text-[10px] text-slate-500 font-mono mt-1">
                      Visualisasi Matplotlib / Seaborn (Base64 Rendered)
                    </span>
                  </div>
                ) : (
                  <div className="text-slate-500 italic">Tidak ada panggilan `plt.show()` atau objek gambar pada eksekusi ini.</div>
                )}
              </div>
            )}
          </AnimatedTabContent>
        </div>
      </div>
    </div>
  );
};
