"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Editor, { OnMount } from "@monaco-editor/react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Code2,
  Copy,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  HardDrive,
  HelpCircle,
  Layers,
  Maximize2,
  Minimize2,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Share2,
  SplitSquareVertical,
  Trash2,
  Trophy,
  X,
} from "lucide-react";

export interface NotebookCell {
  id: string;
  type: "code" | "markdown";
  content: string;
  output?: string;
  error?: string;
  execution_count?: number | null;
  execution_time_ms?: number;
  is_editing_md?: boolean;
}

interface DatasetFileItem {
  name: string;
  relative_path: string;
  full_path: string;
  size_bytes: number;
  extension: string;
}

interface KaggleNotebookWorkspaceProps {
  notebookId?: string | number;
  datasetRef?: string | null;
}

export const KaggleNotebookWorkspace: React.FC<KaggleNotebookWorkspaceProps> = ({
  notebookId,
  datasetRef,
}) => {
  const [title, setTitle] = useState<string>("Untitled-Notebook.ipynb");
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [activeDatasetRef, setActiveDatasetRef] = useState<string>(datasetRef || "uciml/iris");

  // Cells state
  const [cells, setCells] = useState<NotebookCell[]>([
    {
      id: "cell-1",
      type: "markdown",
      content:
        "# Analisis Data Eksploratif (EDA)\nNotebook interaktif lingkungan Kaggle Axion LMS untuk eksplorasi dataset dan pemodelan machine learning.",
      execution_count: null,
      is_editing_md: false,
    },
    {
      id: "cell-2",
      type: "code",
      content:
        "# This Python 3 environment comes with many helpful analytics libraries installed\n# It is defined by the Axion / Kaggle environment\n\nimport numpy as np # linear algebra\nimport pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)\nimport os\n\nprint('=== KAGGLE ENVIRONMENT INITIALIZED ===')\nprint(f'Active dataset reference: {activeDatasetRef}')\n\nfor dirname, _, filenames in os.walk('data/datasets'):\n    for filename in filenames:\n        print(os.path.join(dirname, filename))\n",
      output: "",
      execution_count: null,
    },
    {
      id: "cell-3",
      type: "code",
      content:
        "# Contoh analisis data menggunakan pandas\n# df = pd.read_csv('/kaggle/input/" +
        (datasetRef ? datasetRef.split("/").pop() : "dataset") +
        "/data.csv')\n# print(df.head())\nprint('Siap untuk menulis kode visualisasi & feature engineering!')\n",
      output: "",
      execution_count: null,
    },
  ]);

  const [activeCellId, setActiveCellId] = useState<string>("cell-2");
  const [globalExecutionCount, setGlobalExecutionCount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);

  // Right Panel Drawer: Data vs Session Metrics
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState<boolean>(true);
  const [rightDrawerTab, setRightDrawerTab] = useState<"DATA" | "METRICS">("DATA");
  const [datasetFiles, setDatasetFiles] = useState<DatasetFileItem[]>([]);
  const [copiedPathNotice, setCopiedPathNotice] = useState<string | null>(null);

  // Active Dropdown Menu
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Submit Solution to Competition Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [submitDatasetRef, setSubmitDatasetRef] = useState<string>(activeDatasetRef || "uciml/iris");
  const [submitVersion, setSubmitVersion] = useState<string>("v1.0 - Baseline");
  const [submitModelName, setSubmitModelName] = useState<string>("Random Forest Classifier");
  const [submitPipelineFlow, setSubmitPipelineFlow] = useState<string>("StandardScaler → PCA → Random Forest");
  const [submitAccuracy, setSubmitAccuracy] = useState<string>("0.9500");
  const [submitF1, setSubmitF1] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load notebook if notebookId provided
  useEffect(() => {
    if (!notebookId || notebookId === "new") return;
    fetch(`/api/v1/notebooks/${notebookId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.title) setTitle(data.title);
        if (data.dataset_ref) {
          setActiveDatasetRef(data.dataset_ref);
          setSubmitDatasetRef(data.dataset_ref);
        }
        if (data.cells && data.cells.length > 0) {
          setCells(data.cells);
          setActiveCellId(data.cells[0].id);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("olympus:notebook_opened", { detail: { id: notebookId } }));
        }
      })
      .catch((err) => console.error("Error loading notebook:", err));
  }, [notebookId]);

  // Load dataset files for right data drawer
  useEffect(() => {
    const refToFetch = activeDatasetRef || datasetRef || "uciml/iris";
    fetch(`/api/v1/datasets/files?ref=${encodeURIComponent(refToFetch)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.files) {
          setDatasetFiles(data.files);
        }
      })
      .catch((err) => console.error("Error fetching dataset files:", err));
  }, [activeDatasetRef, datasetRef]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleGlobalClick = () => setOpenDropdown(null);
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  // Save Notebook action
  const handleSaveNotebook = async () => {
    setIsSaving(true);
    try {
      if (notebookId && notebookId !== "new") {
        await fetch(`/api/v1/notebooks/${notebookId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, cells }),
        });
      } else {
        const res = await fetch("/api/v1/notebooks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            dataset_ref: activeDatasetRef,
            cells,
          }),
        });
        if (res.ok) {
          const created = await res.json();
          window.history.replaceState(null, "", `/notebooks/${created.id}`);
        }
      }
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } catch (err) {
      alert("Gagal menyimpan notebook ke penyimpanan lokal.");
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Solution to Kaggle Leaderboard action
  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      let acc = parseFloat(submitAccuracy.replace("%", "").trim());
      if (isNaN(acc) || acc < 0) {
        throw new Error("Akurasi harus berupa angka desimal positif (misal 0.95) atau persentase (misal 95%).");
      }
      if (acc > 1.0) {
        acc = acc / 100.0;
      }
      if (acc > 1.0) {
        throw new Error("Skor akurasi maksimal adalah 1.0 (atau 100%).");
      }

      let f1Val: number | null = null;
      if (submitF1.trim()) {
        let f1Parsed = parseFloat(submitF1.replace("%", "").trim());
        if (!isNaN(f1Parsed)) {
          if (f1Parsed > 1.0) f1Parsed = f1Parsed / 100.0;
          f1Val = f1Parsed;
        }
      }

      const res = await fetch("/api/v1/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset_ref: submitDatasetRef,
          model_name: submitModelName.trim() || "Model Solusi",
          solution_version: submitVersion.trim() || "v1.0",
          pipeline_flow: submitPipelineFlow.trim() || `Pipeline ${submitModelName}`,
          accuracy_score: acc,
          f1_score: f1Val,
          notebook_id: notebookId && notebookId !== "new" ? Number(notebookId) : null,
          parameters: {
            solution_version: submitVersion.trim() || "v1.0",
            dataset_ref: submitDatasetRef,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Gagal mencatat solusi ke server.");
      }

      setSubmitStatus({
        type: "success",
        message: `Solusi (${submitVersion}) berhasil dicatat ke Leaderboard Kompetisi dengan skor akurasi ${(acc * 100).toFixed(2)}%!`,
      });

      try {
        const { invalidateCache } = await import("@/lib/apiCache");
        invalidateCache("/api/v1/leaderboard/by-dataset");
      } catch {}
    } catch (err: any) {
      setSubmitStatus({
        type: "error",
        message: err.message || "Terjadi kesalahan saat submit solusi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Execute a single code cell
  const executeCell = async (cellId: string) => {
    const cellIndex = cells.findIndex((c) => c.id === cellId);
    if (cellIndex === -1) return;
    const targetCell = cells[cellIndex];
    if (targetCell.type !== "code") return;

    const nextCount = globalExecutionCount + 1;
    setGlobalExecutionCount(nextCount);

    // Set running state indicator
    setCells((prev) =>
      prev.map((c) =>
        c.id === cellId
          ? { ...c, execution_count: nextCount, output: "Menjalankan sel..." }
          : c
      )
    );

    try {
      const res = await fetch("/api/v1/execute/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: targetCell.content,
          timeout_seconds: 15,
        }),
      });
      const data = await res.json();

      let finalOutput = data.stdout || "";
      if (data.stderr) {
        finalOutput += (finalOutput ? "\n" : "") + data.stderr;
      }
      if (!finalOutput && data.error_message) {
        finalOutput = data.error_message;
      }
      if (!finalOutput) {
        finalOutput = "(Eksekusi selesai tanpa keluaran stdout)";
      }

      setCells((prev) =>
        prev.map((c) =>
          c.id === cellId
            ? {
                ...c,
                output: finalOutput,
                error: data.success ? undefined : data.stderr || data.error_message,
                execution_time_ms: data.execution_time_ms,
              }
            : c
        )
      );
    } catch (err: any) {
      setCells((prev) =>
        prev.map((c) =>
          c.id === cellId
            ? {
                ...c,
                output: "",
                error: err.message || "Gagal menghubungkan ke kernel Python.",
              }
            : c
        )
      );
    }
  };

  // Run all cells sequentially
  const handleRunAllCells = async () => {
    setIsRunningAll(true);
    for (const cell of cells) {
      if (cell.type === "code") {
        await executeCell(cell.id);
      }
    }
    setIsRunningAll(false);
  };

  // Cell management helpers
  const addCell = (type: "code" | "markdown", afterId?: string) => {
    const newCell: NotebookCell = {
      id: `cell-${Date.now()}`,
      type,
      content: type === "code" ? "# Tulis kode Python di sini\n" : "Tulis teks markdown di sini...",
      output: "",
      execution_count: null,
      is_editing_md: true,
    };

    if (!afterId) {
      setCells((prev) => [...prev, newCell]);
    } else {
      const idx = cells.findIndex((c) => c.id === afterId);
      const updated = [...cells];
      updated.splice(idx + 1, 0, newCell);
      setCells(updated);
    }
    setActiveCellId(newCell.id);
  };

  const deleteCell = (id: string) => {
    if (cells.length <= 1) return;
    setCells((prev) => prev.filter((c) => c.id !== id));
  };

  const moveCell = (id: string, direction: "up" | "down") => {
    const idx = cells.findIndex((c) => c.id === id);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === cells.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const updated = [...cells];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCells(updated);
  };

  const handleCopyCodeSnippet = (path: string) => {
    const codeSnippet = `pd.read_csv('${path}')`;
    navigator.clipboard.writeText(codeSnippet);
    setCopiedPathNotice(path);
    setTimeout(() => setCopiedPathNotice(null), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-root select-none">
      {/* 1. KAGGLE TOP HEADER BAR */}
      <header className="h-12 bg-surface border-b border-border-def px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-slate-100">
            <div className="w-6 h-6 rounded bg-primary-muted border border-primary/40 flex items-center justify-center">
              <FileCode className="w-3.5 h-3.5 text-primary" />
            </div>
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                autoFocus
                className="bg-root border border-primary px-2 py-0.5 rounded font-mono text-label text-slate-100 focus:outline-none"
              />
            ) : (
              <span
                onClick={() => setIsEditingTitle(true)}
                title="Klik untuk mengubah nama notebook"
                className="font-mono text-label font-medium text-slate-100 hover:text-primary cursor-pointer border-b border-dashed border-slate-600 hover:border-primary transition-colors"
              >
                {title}
              </span>
            )}
          </div>

          <span className="text-slate-600 text-meta">|</span>

          {/* Session Status Badges */}
          <div className="hidden md:flex items-center space-x-2 text-meta font-mono">
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Draft Session</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-elevated text-slate-300 border border-border-def">
              Python 3
            </span>
            <span className="px-2 py-0.5 rounded bg-elevated text-slate-400 border border-border-def">
              CPU: 4 Cores, 16GB RAM
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-2">
          {saveSuccessNotice && (
            <span className="text-meta text-emerald-400 flex items-center space-x-1 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tersimpan!</span>
            </span>
          )}

          <button
            onClick={handleSaveNotebook}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-3 py-1 bg-elevated hover:bg-surface border border-border-def rounded text-label font-medium text-slate-200 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-primary" />
            <span>{isSaving ? "Menyimpan..." : "Save Version"}</span>
          </button>

          <button
            onClick={handleRunAllCells}
            disabled={isRunningAll}
            className="flex items-center space-x-1.5 px-3 py-1 bg-primary hover:bg-primary-hover text-white rounded text-label font-medium transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunningAll ? "Menjalankan..." : "Run All"}</span>
          </button>

          <button
            onClick={() => {
              setSubmitDatasetRef(activeDatasetRef || "uciml/iris");
              setSubmitStatus(null);
              setIsSubmitModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 rounded text-label font-medium transition-colors"
            title="Kirim skor dan versi solusi ke Papan Peringkat Kompetisi"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Submit Solusi</span>
          </button>

          <button
            onClick={() => setIsRightDrawerOpen(!isRightDrawerOpen)}
            title="Toggle Panel Data Kaggle"
            className={`p-1.5 rounded border transition-colors ${
              isRightDrawerOpen
                ? "bg-primary-muted border-primary/40 text-primary"
                : "bg-elevated border-border-def text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. KAGGLE MENU BAR (File, Edit, View, Insert, Run, Tools, Help) */}
      <div className="h-8 bg-elevated border-b border-border-def px-3 flex items-center space-x-1 text-label text-slate-300 z-20 shrink-0">
        {/* Menu Items */}
        {[
          {
            name: "File",
            items: [
              { label: "New Notebook", action: () => (window.location.href = "/notebooks/new") },
              { label: "Save Version (Ctrl+S)", action: handleSaveNotebook },
              {
                label: "Download .ipynb",
                action: () => alert("Mengunduh file notebook .ipynb lokal..."),
              },
              { label: "Export HTML", action: () => alert("Mengekspor notebook ke HTML...") },
            ],
          },
          {
            name: "Edit",
            items: [
              {
                label: "Cut Selected Cell",
                action: () => activeCellId && deleteCell(activeCellId),
              },
              {
                label: "Copy Selected Cell",
                action: () => alert("Kode sel disalin ke clipboard."),
              },
              {
                label: "Delete Selected Cell",
                action: () => activeCellId && deleteCell(activeCellId),
              },
              {
                label: "Clear All Outputs",
                action: () =>
                  setCells((prev) =>
                    prev.map((c) => ({ ...c, output: "", execution_count: null }))
                  ),
              },
            ],
          },
          {
            name: "View",
            items: [
              {
                label: "Toggle Data Panel",
                action: () => setIsRightDrawerOpen(!isRightDrawerOpen),
              },
            ],
          },
          {
            name: "Insert",
            items: [
              { label: "Insert Code Cell Below", action: () => addCell("code", activeCellId) },
              {
                label: "Insert Markdown Cell Below",
                action: () => addCell("markdown", activeCellId),
              },
            ],
          },
          {
            name: "Run",
            items: [
              {
                label: "Run Selected Cell (Shift+Enter)",
                action: () => activeCellId && executeCell(activeCellId),
              },
              { label: "Run All Cells", action: handleRunAllCells },
              {
                label: "Submit Solusi ke Kompetisi...",
                action: () => {
                  setSubmitDatasetRef(activeDatasetRef || "uciml/iris");
                  setSubmitStatus(null);
                  setIsSubmitModalOpen(true);
                },
              },
              {
                label: "Restart Kernel Session",
                action: () => {
                  setGlobalExecutionCount(0);
                  alert("Kernel session restarted.");
                },
              },
            ],
          },
          {
            name: "Tools",
            items: [
              {
                label: "Variable Inspector",
                action: () => alert("Variable Inspector aktif pada kernel Python."),
              },
              {
                label: "Command Palette",
                action: () => alert("Tekan F1 di dalam editor untuk membuka Command Palette."),
              },
            ],
          },
          {
            name: "Help",
            items: [
              {
                label: "Kaggle Documentation",
                action: () => window.open("https://www.kaggle.com/docs", "_blank"),
              },
              {
                label: "Pandas Documentation",
                action: () => window.open("https://pandas.pydata.org/docs/", "_blank"),
              },
              {
                label: "Python Reference",
                action: () => window.open("https://docs.python.org/3/", "_blank"),
              },
            ],
          },
        ].map((menu) => (
          <div key={menu.name} className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpenDropdown(openDropdown === menu.name ? null : menu.name)}
              className={`px-2.5 py-0.5 rounded text-label hover:bg-surface hover:text-white transition-colors ${
                openDropdown === menu.name ? "bg-surface text-white" : ""
              }`}
            >
              {menu.name}
            </button>

            {openDropdown === menu.name && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-surface border border-border-def rounded shadow-xl py-1 z-50 text-label">
                {menu.items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setOpenDropdown(null);
                      item.action();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-elevated hover:text-primary transition-colors text-slate-300 block"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="flex-1" />

        {/* Quick Cell Insertion Toolbar */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => addCell("code", activeCellId)}
            className="flex items-center space-x-1 px-2 py-0.5 bg-primary/20 hover:bg-primary/30 border border-primary/50 text-primary rounded text-meta font-medium transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Code</span>
          </button>

          <button
            onClick={() => addCell("markdown", activeCellId)}
            className="flex items-center space-x-1 px-2 py-0.5 bg-surface hover:bg-elevated border border-border-def text-slate-300 rounded text-meta font-medium transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Markdown</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE AREA: Cells (Left) + Data Drawer (Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Cells Scrolling Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cells.map((cell, idx) => (
            <div
              key={cell.id}
              onClick={() => setActiveCellId(cell.id)}
              className={`border rounded-md bg-surface transition-all ${
                activeCellId === cell.id
                  ? "border-primary/60 shadow-lg ring-1 ring-primary/20"
                  : "border-border-def hover:border-slate-600"
              }`}
            >
              {/* Cell Header Controls */}
              <div className="h-8 px-3 bg-elevated/70 border-b border-border-def flex items-center justify-between text-meta">
                <div className="flex items-center space-x-2">
                  {cell.type === "code" ? (
                    <button
                      onClick={() => executeCell(cell.id)}
                      className="p-1 hover:bg-surface rounded text-primary hover:text-primary-hover transition-colors"
                      title="Jalankan Sel Ini (Shift+Enter)"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  ) : (
                    <FileCode className="w-3.5 h-3.5 text-slate-400" />
                  )}

                  <span className="font-mono text-slate-400">
                    {cell.type === "code"
                      ? `[ ${cell.execution_count ? cell.execution_count : " "} ]`
                      : "Markdown"}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-slate-400">
                  {cell.execution_time_ms && (
                    <span className="font-mono text-slate-500 mr-2 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{cell.execution_time_ms} ms</span>
                    </span>
                  )}

                  <button
                    onClick={() => moveCell(cell.id, "up")}
                    disabled={idx === 0}
                    className="p-1 hover:bg-surface rounded disabled:opacity-30"
                    title="Pindah ke Atas"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveCell(cell.id, "down")}
                    disabled={idx === cells.length - 1}
                    className="p-1 hover:bg-surface rounded disabled:opacity-30"
                    title="Pindah ke Bawah"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteCell(cell.id)}
                    className="p-1 hover:bg-surface rounded text-rose-400 hover:text-rose-300"
                    title="Hapus Sel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cell Body: Monaco Code Editor or Markdown View */}
              <div className="p-2">
                {cell.type === "code" ? (
                  <div className="min-h-[90px] border border-border-def rounded overflow-hidden">
                    <Editor
                      height={Math.max(80, cell.content.split("\n").length * 20 + 20)}
                      language="python"
                      value={cell.content}
                      onChange={(val) => {
                        setCells((prev) =>
                          prev.map((c) => (c.id === cell.id ? { ...c, content: val || "" } : c))
                        );
                      }}
                      onMount={(editor, monaco) => {
                        monaco.editor.setTheme("vs-dark");
                        editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
                          executeCell(cell.id);
                        });
                      }}
                      options={{
                        fontSize: 13,
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        minimap: { enabled: false },
                        lineNumbers: "on",
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        tabSize: 4,
                        padding: { top: 6, bottom: 6 },
                      }}
                    />
                  </div>
                ) : cell.is_editing_md ? (
                  <div className="space-y-2">
                    <textarea
                      value={cell.content}
                      onChange={(e) =>
                        setCells((prev) =>
                          prev.map((c) =>
                            c.id === cell.id ? { ...c, content: e.target.value } : c
                          )
                        )
                      }
                      rows={4}
                      className="w-full p-2.5 bg-root border border-border-def rounded text-slate-200 font-mono text-label focus:outline-none focus:border-primary resize-y"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() =>
                          setCells((prev) =>
                            prev.map((c) =>
                              c.id === cell.id ? { ...c, is_editing_md: false } : c
                            )
                          )
                        }
                        className="px-3 py-1 bg-elevated hover:bg-surface border border-border-def rounded text-meta font-medium text-slate-200"
                      >
                        Selesai Edit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDoubleClick={() =>
                      setCells((prev) =>
                        prev.map((c) => (c.id === cell.id ? { ...c, is_editing_md: true } : c))
                      )
                    }
                    className="p-3 prose prose-invert max-w-none text-slate-200 cursor-pointer hover:bg-elevated/40 rounded transition-colors"
                    title="Klik dua kali untuk mengedit markdown"
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{cell.content}</div>
                  </div>
                )}
              </div>

              {/* Cell Output Container */}
              {cell.type === "code" && (cell.output || cell.error) && (
                <div className="border-t border-border-def bg-root/90 p-3 font-mono text-label">
                  {cell.error ? (
                    <div className="p-2 bg-rose-950/40 border border-rose-800/60 rounded text-rose-300 text-meta space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Execution Error</span>
                      </div>
                      <pre className="whitespace-pre-wrap overflow-x-auto text-xs">{cell.output || cell.error}</pre>
                    </div>
                  ) : (
                    <pre className="text-slate-200 whitespace-pre-wrap overflow-x-auto text-xs leading-relaxed">
                      {cell.output}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Quick Add Bottom Buttons */}
          <div className="py-4 flex items-center justify-center space-x-3">
            <button
              onClick={() => addCell("code")}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/50 text-primary rounded-full text-label font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Sel Kode</span>
            </button>
            <button
              onClick={() => addCell("markdown")}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-surface hover:bg-elevated border border-border-def text-slate-300 rounded-full text-label font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Sel Markdown</span>
            </button>
          </div>

        </div>

        {/* 5. RIGHT COLLAPSIBLE DRAWER: Data (/kaggle/input) & Session Metrics */}
        {isRightDrawerOpen && (
          <aside className="w-80 border-l border-border-def bg-surface flex flex-col shrink-0">
            {/* Tab switch: Data vs Metrics */}
            <div className="h-10 border-b border-border-def bg-elevated flex items-center px-2">
              <button
                onClick={() => setRightDrawerTab("DATA")}
                className={`flex-1 py-1 text-label font-medium rounded flex items-center justify-center space-x-1.5 transition-colors ${
                  rightDrawerTab === "DATA"
                    ? "bg-surface text-primary border border-primary/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Input Data</span>
              </button>
              <button
                onClick={() => setRightDrawerTab("METRICS")}
                className={`flex-1 py-1 text-label font-medium rounded flex items-center justify-center space-x-1.5 transition-colors ${
                  rightDrawerTab === "METRICS"
                    ? "bg-surface text-primary border border-primary/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Metrics</span>
              </button>
            </div>

            {/* Tab 1: DATA EXPLORER (/kaggle/input) */}
            {rightDrawerTab === "DATA" && (
              <div className="flex-1 p-3 overflow-y-auto space-y-3 font-mono text-meta">
                <div className="p-2 bg-root border border-border-def rounded space-y-1">
                  <span className="text-slate-500 block">Direktori input Kaggle:</span>
                  <span className="text-primary font-semibold block">
                    /kaggle/input/{activeDatasetRef.split("/").pop()}
                  </span>
                </div>

                {copiedPathNotice && (
                  <div className="p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded text-meta flex items-center space-x-1 animate-fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Kode pd.read_csv disalin ke clipboard!</span>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-slate-400 font-semibold block">File yang tersedia:</span>
                  {datasetFiles.length === 0 ? (
                    <div className="p-3 text-slate-500 text-center bg-root rounded border border-border-def text-meta">
                      Belum ada file terdeteksi di folder dataset lokal ini.
                    </div>
                  ) : (
                    datasetFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-root border border-border-def rounded hover:border-slate-600 transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200 truncate max-w-[170px]" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            {file.size_bytes > 1024 * 1024
                              ? `${(file.size_bytes / (1024 * 1024)).toFixed(1)} MB`
                              : `${(file.size_bytes / 1024).toFixed(0)} KB`}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            handleCopyCodeSnippet(
                              `/kaggle/input/${activeDatasetRef.split("/").pop()}/${file.name}`
                            )
                          }
                          className="flex items-center space-x-1 text-primary hover:text-primary-hover text-[11px] font-medium"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy pd.read_csv path</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: SESSION METRICS (CPU, RAM, Disk) */}
            {rightDrawerTab === "METRICS" && (
              <div className="flex-1 p-4 space-y-4 font-mono text-meta text-slate-300">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-meta">
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Cpu className="w-3.5 h-3.5 text-primary" />
                      <span>CPU Usage</span>
                    </span>
                    <span className="text-primary font-bold">18%</span>
                  </div>
                  <div className="w-full bg-root h-2 rounded-full overflow-hidden border border-border-def">
                    <div className="bg-primary h-full rounded-full" style={{ width: "18%" }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-meta">
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>RAM Memory</span>
                    </span>
                    <span className="text-emerald-400 font-bold">1.4 GB / 16.0 GB</span>
                  </div>
                  <div className="w-full bg-root h-2 rounded-full overflow-hidden border border-border-def">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: "9%" }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-meta">
                    <span className="text-slate-400 flex items-center space-x-1">
                      <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                      <span>Disk Space</span>
                    </span>
                    <span className="text-amber-400 font-bold">5.2 GB / 73.0 GB</span>
                  </div>
                  <div className="w-full bg-root h-2 rounded-full overflow-hidden border border-border-def">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: "7%" }} />
                  </div>
                </div>

                <div className="p-3 bg-root border border-border-def rounded space-y-1 text-slate-400 text-meta">
                  <span className="text-slate-200 font-semibold block">Akselerator Hardware:</span>
                  <p>CPU Standard (NVIDIA CUDA Fallback Active)</p>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* 4. MODAL: SUBMIT SOLUSI KE LEADERBOARD KOMPETISI */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border-def rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-fade-in">
            {/* Modal Header */}
            <div className="p-4 border-b border-border-def flex items-center justify-between bg-elevated/70">
              <div className="flex items-center space-x-2 text-slate-100 font-semibold text-sm">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Trophy className="w-4 h-4" />
                </div>
                <span>Submit Solusi ke Leaderboard Kompetisi</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitSolution} className="p-5 space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Catat hasil evaluasi dan versi model Anda ke Papan Peringkat publik Kaggle Axion. Skor akurasi akan menentukan posisi ranking Anda di kompetisi.
              </p>

              {/* Status Message */}
              {submitStatus && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start space-x-2 ${
                    submitStatus.type === "success"
                      ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-300"
                      : "bg-rose-950/60 border-rose-700/60 text-rose-300"
                  }`}
                >
                  {submitStatus.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1.5">
                    <p>{submitStatus.message}</p>
                    {submitStatus.type === "success" && (
                      <div className="pt-1">
                        <Link
                          href="/leaderboard"
                          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] transition-colors"
                        >
                          <Trophy className="w-3 h-3" />
                          <span>Buka Papan Peringkat Kompetisi →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dataset / Competition Select */}
              <div className="space-y-1.5">
                <label className="text-meta font-mono text-slate-300 flex items-center justify-between">
                  <span>Kompetisi / Dataset Tujuan</span>
                  <span className="text-slate-500 text-[10px]">Wajib</span>
                </label>
                <select
                  value={submitDatasetRef}
                  onChange={(e) => setSubmitDatasetRef(e.target.value)}
                  className="w-full bg-root border border-border-def rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono cursor-pointer"
                >
                  <option value="uciml/iris">uciml/iris (Iris Species Classification)</option>
                  <option value="heptapod/titanic">heptapod/titanic (Titanic: ML from Disaster)</option>
                  <option value="zalando-research/fashionmnist">zalando-research/fashionmnist (Fashion-MNIST)</option>
                  <option value="camnugent/california-housing-prices">camnugent/california-housing-prices (California Housing)</option>
                </select>
              </div>

              {/* Solution Version & Model Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-meta font-mono text-slate-300 flex items-center justify-between">
                    <span>Versi Solusi</span>
                    <span className="text-slate-500 text-[10px]">Misal: v1.0</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={submitVersion}
                    onChange={(e) => setSubmitVersion(e.target.value)}
                    placeholder="v1.0 - Baseline"
                    className="w-full bg-root border border-border-def rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-meta font-mono text-slate-300 flex items-center justify-between">
                    <span>Nama Model</span>
                    <span className="text-slate-500 text-[10px]">Arsitektur</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={submitModelName}
                    onChange={(e) => setSubmitModelName(e.target.value)}
                    placeholder="XGBoost Classifier"
                    className="w-full bg-root border border-border-def rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              {/* Pipeline Flow */}
              <div className="space-y-1.5">
                <label className="text-meta font-mono text-slate-300 flex items-center justify-between">
                  <span>Alur Pipeline Solusi</span>
                  <span className="text-slate-500 text-[10px]">Pisahkan dengan →</span>
                </label>
                <input
                  type="text"
                  value={submitPipelineFlow}
                  onChange={(e) => setSubmitPipelineFlow(e.target.value)}
                  placeholder="StandardScaler → PCA → XGBoost"
                  className="w-full bg-root border border-border-def rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono"
                />
              </div>

              {/* Accuracy & F1-Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-meta font-mono text-slate-300 flex items-center justify-between">
                    <span>Skor Akurasi (Accuracy)</span>
                    <span className="text-amber-400 text-[10px]">0.0 - 1.0</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={submitAccuracy}
                    onChange={(e) => setSubmitAccuracy(e.target.value)}
                    placeholder="0.9520 atau 95.2%"
                    className="w-full bg-root border border-border-def rounded px-3 py-2 text-xs text-emerald-400 font-bold font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-meta font-mono text-slate-300 flex items-center justify-between">
                    <span>F1-Score (Opsional)</span>
                    <span className="text-slate-500 text-[10px]">0.0 - 1.0</span>
                  </label>
                  <input
                    type="text"
                    value={submitF1}
                    onChange={(e) => setSubmitF1(e.target.value)}
                    placeholder="0.9480 (opsional)"
                    className="w-full bg-root border border-border-def rounded px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-border-def/60">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-3 py-1.5 bg-surface hover:bg-elevated border border-border-def rounded text-xs text-slate-300 transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-primary hover:bg-primary-hover text-white rounded text-xs font-semibold shadow-md shadow-primary/25 transition-all disabled:opacity-50"
                >
                  <Trophy className="w-3.5 h-3.5 fill-current text-amber-300" />
                  <span>{isSubmitting ? "Mengirimkan Solusi..." : "Submit Solusi Sekarang"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
