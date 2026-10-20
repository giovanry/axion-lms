"use client";

import React, { useEffect, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileText,
  Globe2,
  Languages,
  Layers,
  Loader2,
  Maximize2,
  Minimize2,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useLmsStore } from "@/stores/useLmsStore";
import { fetchWithCache } from "@/lib/apiCache";
import { useDebounce } from "@/hooks/useDebounce";

interface CfProblemsetItem {
  id: string;
  contest_id: number;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
}

const CURATED_PROBLEMS: CfProblemsetItem[] = [
  { id: "4A", contest_id: 4, index: "A", name: "Watermelon", rating: 800, tags: ["brute force", "math"] },
  { id: "71A", contest_id: 71, index: "A", name: "Way Too Long Words", rating: 800, tags: ["strings"] },
  { id: "158A", contest_id: 158, index: "A", name: "Next Round", rating: 800, tags: ["special problem"] },
  { id: "231A", contest_id: 231, index: "A", name: "Team", rating: 800, tags: ["brute force", "greedy"] },
  { id: "1A", contest_id: 1, index: "A", name: "Theatre Square", rating: 1000, tags: ["math"] },
  { id: "112A", contest_id: 112, index: "A", name: "Petya and Strings", rating: 800, tags: ["implementation", "strings"] },
  { id: "282A", contest_id: 282, index: "A", name: "Bit++", rating: 800, tags: ["implementation"] },
  { id: "263A", contest_id: 263, index: "A", name: "Beautiful Matrix", rating: 800, tags: ["implementation"] },
  { id: "339A", contest_id: 339, index: "A", name: "Helpful Maths", rating: 800, tags: ["greedy", "sortings"] },
  { id: "96A", contest_id: 96, index: "A", name: "Football", rating: 900, tags: ["strings"] },
  { id: "50A", contest_id: 50, index: "A", name: "Domino piling", rating: 800, tags: ["greedy", "math"] },
  { id: "266A", contest_id: 266, index: "A", name: "Stones on the Table", rating: 800, tags: ["implementation"] },
  { id: "617A", contest_id: 617, index: "A", name: "Elephant", rating: 800, tags: ["math"] },
  { id: "546A", contest_id: 546, index: "A", name: "Soldier and Bananas", rating: 800, tags: ["math"] },
  { id: "791A", contest_id: 791, index: "A", name: "Bear and Big Brother", rating: 800, tags: ["implementation"] },
  { id: "118A", contest_id: 118, index: "A", name: "String Task", rating: 1000, tags: ["strings"] },
  { id: "160A", contest_id: 160, index: "A", name: "Twins", rating: 900, tags: ["greedy", "sortings"] },
  { id: "136A", contest_id: 136, index: "A", name: "Presents", rating: 800, tags: ["implementation"] },
  { id: "467A", contest_id: 467, index: "A", name: "George and Accommodation", rating: 800, tags: ["implementation"] },
  { id: "486A", contest_id: 486, index: "A", name: "Calculating Function", rating: 800, tags: ["math"] },
  { id: "69A", contest_id: 69, index: "A", name: "Young Physicist", rating: 1000, tags: ["math"] },
  { id: "1328A", contest_id: 1328, index: "A", name: "Divisibility Problem", rating: 800, tags: ["math"] },
  { id: "479A", contest_id: 479, index: "A", name: "Expression", rating: 1000, tags: ["math"] },
  { id: "25A", contest_id: 25, index: "A", name: "IQ test", rating: 1300, tags: ["brute force"] },
  { id: "492B", contest_id: 492, index: "B", name: "Vanya and Lanterns", rating: 1200, tags: ["binary search", "math"] },
  { id: "189A", contest_id: 189, index: "A", name: "Cut Ribbon", rating: 1300, tags: ["dp"] },
  { id: "455A", contest_id: 455, index: "A", name: "Boredom", rating: 1500, tags: ["dp"] },
];

interface ProblemItem {
  id: string;
  title: string;
  contest_id?: number;
  index?: string;
  time_limit_ms: number;
  has_translation: boolean;
}

interface ProblemDetail {
  id: string;
  title: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  statement_en: string;
  statement_id?: string;
  input_specification_en: string;
  output_specification_en: string;
  input_specification_id?: string;
  output_specification_id?: string;
  sample_cases: Array<{ input: string; output: string }>;
}

const DEFAULT_PYTHON_TEMPLATE = `import sys

def solve():
    # Masukkan solusi Codeforces di sini
    pass

if __name__ == '__main__':
    solve()
`;

const DEFAULT_CPP_TEMPLATE = `#include <bits/stdc++.h>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Tulis solusi Codeforces di sini
    
    return 0;
}
`;

type TerminalHeightPreset = "compact" | "standard" | "large" | "fullscreen";

export const CodeforcesWorkspace: React.FC = () => {
  const [problemList, setProblemList] = useState<ProblemItem[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<string>("4A");
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [language, setLanguage] = useState<"EN" | "ID">("ID");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Left Pane View Mode: Problem Details vs Codeforces Catalog
  const [leftTab, setLeftTab] = useState<"PROBLEM" | "IFRAME">("PROBLEM");
  const [cfUrl, setCfUrl] = useState<string>("https://codeforces.com/problemset");
  const [customCfUrl, setCustomCfUrl] = useState<string>("https://codeforces.com/problemset");

  // Problemset Explorer state
  const [problemsetList, setProblemsetList] = useState<CfProblemsetItem[]>(CURATED_PROBLEMS);
  const [isLoadingProblemset, setIsLoadingProblemset] = useState<boolean>(false);
  const [cfSearch, setCfSearch] = useState<string>("");
  const debouncedCfSearch = useDebounce(cfSearch, 280);
  const [cfRatingFilter, setCfRatingFilter] = useState<number | "ALL">("ALL");
  const [cfTagFilter, setCfTagFilter] = useState<string>("ALL");
  const [showIframeOption, setShowIframeOption] = useState<boolean>(false);
  const [visibleProblemCount, setVisibleProblemCount] = useState<number>(35);

  useEffect(() => {
    setVisibleProblemCount(35);
  }, [debouncedCfSearch, cfRatingFilter, cfTagFilter]);

  // Adding New Problem to Cache
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newProblemCode, setNewProblemCode] = useState<string>("");
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (leftTab === "IFRAME") {
      setIsLoadingProblemset(true);
      fetchWithCache<{ total: number; problems: CfProblemsetItem[] }>(
        "/api/v1/codeforces/problemset?limit=100",
        {},
        300000
      )
        .then((res) => {
          if (res && res.problems && res.problems.length > 0) {
            setProblemsetList(res.problems);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingProblemset(false));
    }
  }, [leftTab]);

  const handleLoadProblemToPlayground = async (p: CfProblemsetItem) => {
    try {
      setIsAdding(true);
      const res = await fetch("/api/v1/codeforces/problem/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem_id: p.id }),
      });
      if (res.ok) {
        if (!problemList.some((item) => item.id === p.id)) {
          setProblemList((prev) => [
            {
              id: p.id,
              title: p.name,
              contest_id: p.contest_id,
              index: p.index,
              time_limit_ms: 1000,
              has_translation: false,
            },
            ...prev,
          ]);
        }
        setSelectedProblemId(p.id);
        setLeftTab("PROBLEM");
        setAddSuccess(`Soal ${p.id} (${p.name}) berhasil dimuat ke playground!`);
        setTimeout(() => setAddSuccess(null), 3000);
      } else {
        setSelectedProblemId(p.id);
        setLeftTab("PROBLEM");
      }
    } catch {
      setSelectedProblemId(p.id);
      setLeftTab("PROBLEM");
    } finally {
      setIsAdding(false);
    }
  };

  const getRatingBadgeStyle = (rating?: number) => {
    if (!rating) return "text-slate-400 bg-slate-800/80 border-slate-700";
    if (rating <= 1000) return "text-emerald-400 bg-emerald-950/40 border-emerald-500/30";
    if (rating <= 1300) return "text-cyan-400 bg-cyan-950/40 border-cyan-500/30";
    if (rating <= 1600) return "text-blue-400 bg-blue-950/40 border-blue-500/30";
    if (rating <= 1900) return "text-purple-400 bg-purple-950/40 border-purple-500/30";
    return "text-red-400 bg-red-950/40 border-red-500/30";
  };

  // Programming language selection: C++ or Python
  const [progLanguage, setProgLanguage] = useState<"cpp" | "python">("cpp");
  const [pythonCode, setPythonCode] = useState<string>(DEFAULT_PYTHON_TEMPLATE);
  const [cppCode, setCppCode] = useState<string>(DEFAULT_CPP_TEMPLATE);

  // Terminal height sizing
  const [terminalSize, setTerminalSize] = useState<TerminalHeightPreset>("standard");

  const [activeTab, setActiveTab] = useState<"SAMPLES" | "CUSTOM">("SAMPLES");
  const [customInput, setCustomInput] = useState<string>("");

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);

  const { setAiContext } = useLmsStore();

  useEffect(() => {
    fetch("/api/v1/codeforces/problems")
      .then((res) => res.json())
      .then((data) => {
        setProblemList(data);
        if (data.length > 0 && !selectedProblemId) {
          setSelectedProblemId(data[0].id);
        }
      })
      .catch((err) => console.error("Error fetching problems:", err));
  }, []);

  useEffect(() => {
    if (!selectedProblemId) return;
    fetch(`/api/v1/codeforces/problem/${selectedProblemId}`)
      .then((res) => res.json())
      .then((data) => {
        setProblem(data);
        setResult(null);
      })
      .catch((err) => console.error("Error fetching problem detail:", err));
  }, [selectedProblemId]);

  const editorRef = React.useRef<any>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.editor.setTheme("vs-dark");
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunTests();
    });
  };

  const handleTranslateWithOllama = async () => {
    if (!problem) return;
    setIsTranslating(true);
    try {
      const res = await fetch("/api/v1/codeforces/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem_id: problem.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setProblem((prev) =>
          prev
            ? {
                ...prev,
                statement_id: data.statement_id,
                input_specification_id: data.input_specification_id,
                output_specification_id: data.output_specification_id,
              }
            : null
        );
        setLanguage("ID");
      }
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAddProblem = async (codeToFetch?: string) => {
    const code = (codeToFetch || newProblemCode).trim().toUpperCase();
    if (!code) return;
    setIsAdding(true);
    setAddError(null);
    setAddSuccess(null);

    try {
      const res = await fetch("/api/v1/codeforces/problem/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem_id: code }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `Soal '${code}' tidak dapat dimuat.`);
      }

      const data = await res.json();
      setProblem(data);
      setSelectedProblemId(data.id);
      setNewProblemCode("");
      setIsAddOpen(false);
      setLeftTab("PROBLEM");
      setAddSuccess(`Soal ${data.id} berhasil ditambahkan dan disimpan di cache!`);
      setTimeout(() => setAddSuccess(null), 3500);

      // Refresh problem dropdown list
      const listRes = await fetch("/api/v1/codeforces/problems");
      if (listRes.ok) {
        const listData = await listRes.json();
        setProblemList(listData);
      }
    } catch (err: any) {
      setAddError(err.message || "Gagal mengambil soal dari Codeforces.");
    } finally {
      setIsAdding(false);
    }
  };

  const currentCode = progLanguage === "cpp" ? cppCode : pythonCode;

  const handleRunTests = async () => {
    if (!problem) return;
    setIsRunning(true);
    setResult(null);

    try {
      const res = await fetch("/api/v1/execute/codeforces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: problem.id,
          code: currentCode,
          language: progLanguage,
          custom_input: activeTab === "CUSTOM" ? customInput : null,
        }),
      });
      if (!res.ok) throw new Error("Execution failed");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        verdict: "RUNTIME_ERROR",
        all_passed: false,
        results: [
          {
            case_number: 1,
            input_data: customInput,
            expected_output: "",
            actual_output: "",
            passed: false,
            execution_time_ms: 0,
            error_message: err.message || "Failed to execute solution.",
          },
        ],
        total_time_ms: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetCode = () => {
    if (progLanguage === "cpp") {
      setCppCode(DEFAULT_CPP_TEMPLATE);
    } else {
      setPythonCode(DEFAULT_PYTHON_TEMPLATE);
    }
    setResult(null);
  };

  const handleAskAiForVerdict = () => {
    if (!result || !problem) return;
    const firstFail = result.results?.find((r: any) => !r.passed) || result.results?.[0];
    const errMsg =
      firstFail?.error_message ||
      `Verdict: ${result.verdict}\nInput: ${firstFail?.input_data}\nExpected: ${firstFail?.expected_output}\nGot: ${firstFail?.actual_output}`;

    setAiContext({
      code: currentCode,
      errorOutput: errMsg,
      title: `Codeforces ${problem.id} - ${problem.title} (${progLanguage.toUpperCase()})`,
    });
  };

  const displayStatement =
    language === "ID" && problem?.statement_id ? problem.statement_id : problem?.statement_en;
  const displayInputSpec =
    language === "ID" && problem?.input_specification_id
      ? problem.input_specification_id
      : problem?.input_specification_en;
  const displayOutputSpec =
    language === "ID" && problem?.output_specification_id
      ? problem.output_specification_id
      : problem?.output_specification_en;

  // Determine terminal height styling
  const terminalHeightClass =
    terminalSize === "compact"
      ? "h-[180px]"
      : terminalSize === "standard"
      ? "h-[300px]"
      : terminalSize === "large"
      ? "h-[450px]"
      : "flex-1";

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Left Pane: Codeforces Problem Statement OR Live Iframe */}
      <div className="w-full md:w-1/2 h-full flex flex-col bg-surface border-r border-border-def overflow-hidden">
        {/* Top View Mode Switcher */}
        <div className="h-10 px-3 bg-root border-b border-border-def flex items-center justify-between text-meta shrink-0">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setLeftTab("PROBLEM")}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-meta font-medium transition-colors ${
                leftTab === "PROBLEM"
                  ? "bg-elevated text-primary border border-primary/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lembar Soal</span>
            </button>
            <button
              onClick={() => setLeftTab("IFRAME")}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-meta font-medium transition-colors ${
                leftTab === "IFRAME"
                  ? "bg-elevated text-primary border border-primary/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Katalog Soal (Problemset)</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="flex items-center space-x-1 px-2.5 py-1 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded text-primary text-meta font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Soal</span>
          </button>
        </div>

        {/* Add Problem Drawer / Form */}
        {isAddOpen && (
          <div className="p-3 bg-elevated border-b border-border-def space-y-2 shrink-0">
            <div className="flex items-center justify-between text-meta">
              <span className="text-slate-200 font-medium">
                Tambah Soal Codeforces ke Cache Lokal:
              </span>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newProblemCode}
                onChange={(e) => setNewProblemCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddProblem()}
                placeholder="Kode soal, misal: 231A, 1A, 158B, 1800C..."
                className="flex-1 px-3 py-1.5 bg-root border border-border-def rounded text-label font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => handleAddProblem()}
                disabled={isAdding || !newProblemCode.trim()}
                className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded text-label font-medium transition-colors whitespace-nowrap flex items-center space-x-1"
              >
                {isAdding ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>{isAdding ? "Mengunduh..." : "Tambah & Simpan"}</span>
              </button>
            </div>
            {addError && <p className="text-meta text-rose-400">{addError}</p>}
          </div>
        )}

        {/* Notification Toast */}
        {addSuccess && (
          <div className="px-3 py-1.5 bg-emerald-950/60 border-b border-emerald-800 text-emerald-400 text-meta flex items-center space-x-1 font-mono shrink-0">
            <Check className="w-3.5 h-3.5" />
            <span>{addSuccess}</span>
          </div>
        )}

        {/* VIEW 1: PROBLEM DETAILS & STATEMENTS */}
        {leftTab === "PROBLEM" && (
          <>
            {/* Top Problem Selector Toolbar */}
            <div className="p-3 bg-elevated border-b border-border-def flex items-center justify-between space-x-2 shrink-0">
              <div className="flex items-center space-x-2 flex-1">
                <span className="text-label font-mono text-primary font-semibold">SOAL:</span>
                <select
                  value={selectedProblemId}
                  onChange={(e) => setSelectedProblemId(e.target.value)}
                  className="bg-root border border-border-def rounded px-2.5 py-1 text-label text-slate-200 focus:outline-none focus:border-primary max-w-[260px] truncate"
                >
                  {problemList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Switch & Ollama Translation Action */}
              <div className="flex items-center space-x-1.5">
                <div className="flex border border-border-def rounded overflow-hidden">
                  <button
                    onClick={() => setLanguage("EN")}
                    className={`px-2 py-0.5 text-meta font-mono transition-colors ${
                      language === "EN"
                        ? "bg-primary text-white"
                        : "bg-root text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage("ID")}
                    className={`px-2 py-0.5 text-meta font-mono transition-colors ${
                      language === "ID"
                        ? "bg-primary text-white"
                        : "bg-root text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    ID
                  </button>
                </div>

                <button
                  onClick={handleTranslateWithOllama}
                  disabled={isTranslating}
                  title="Terjemahkan soal ke Bahasa Indonesia menggunakan Ollama (Llama 3)"
                  className="flex items-center space-x-1 px-2.5 py-1 bg-elevated hover:bg-surface border border-primary/40 rounded text-meta text-primary font-medium transition-colors"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>{isTranslating ? "Menerjemahkan..." : "Terjemah Ollama"}</span>
                </button>
              </div>
            </div>

            {/* Problem Statement Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-body text-slate-300">
              <div>
                <div className="flex items-center justify-between border-b border-border-def pb-2">
                  <h1 className="text-page-title text-slate-100 font-semibold">
                    {problem ? `${problem.id}. ${problem.title}` : "Memuat Soal..."}
                  </h1>
                  {problem && (
                    <div className="flex items-center space-x-2 text-meta font-mono text-slate-400">
                      <span>Waktu: {problem.time_limit_ms}ms</span>
                      <span>Memori: {problem.memory_limit_mb}MB</span>
                    </div>
                  )}
                </div>
              </div>

              {problem ? (
                <>
                  {/* Description */}
                  <div className="space-y-2 whitespace-pre-wrap leading-relaxed">
                    {displayStatement}
                  </div>

                  {/* Input Format */}
                  <div className="space-y-1 pt-2">
                    <h3 className="text-section-header text-slate-100 font-semibold">
                      {language === "ID" ? "Format Masukan" : "Input Specification"}
                    </h3>
                    <p className="whitespace-pre-wrap text-slate-300">{displayInputSpec}</p>
                  </div>

                  {/* Output Format */}
                  <div className="space-y-1 pt-2">
                    <h3 className="text-section-header text-slate-100 font-semibold">
                      {language === "ID" ? "Format Keluaran" : "Output Specification"}
                    </h3>
                    <p className="whitespace-pre-wrap text-slate-300">{displayOutputSpec}</p>
                  </div>

                  {/* Sample Cases */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-section-header text-slate-100 font-semibold">
                      {language === "ID" ? "Contoh Uji Kasus" : "Sample Tests"}
                    </h3>
                    {problem.sample_cases.map((sc, idx) => (
                      <div key={idx} className="border border-border-def rounded overflow-hidden">
                        <div className="grid grid-cols-2 divide-x divide-border-def bg-elevated text-meta text-slate-400 px-3 py-1 font-mono">
                          <span>Masukan #{idx + 1}</span>
                          <span className="pl-3">Keluaran #{idx + 1}</span>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-border-def bg-root font-mono text-label p-3">
                          <pre className="whitespace-pre-wrap text-slate-200">{sc.input}</pre>
                          <pre className="whitespace-pre-wrap text-slate-200 pl-3">{sc.output}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500">Memuat soal Codeforces...</div>
              )}
            </div>
          </>
        )}

        {/* VIEW 2: CODEFORCES INTEGRATED PROBLEMSET EXPLORER */}
        {leftTab === "IFRAME" && (
          <div className="flex-1 flex flex-col overflow-hidden bg-root">
            {/* Top Toolbar */}
            <div className="p-2.5 bg-elevated border-b border-border-def flex items-center justify-between text-meta gap-2 shrink-0">
              <div className="flex items-center space-x-2">
                <Globe2 className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold text-slate-100 text-xs sm:text-sm">
                  Katalog Soal Resmi Codeforces
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  {problemsetList.length > 50 ? "11.000+ Soal" : `${problemsetList.length} Soal`}
                </span>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.open(
                        "https://codeforces.com/problemset",
                        "CF_Popout",
                        "width=1100,height=850,resizable=yes,scrollbars=yes"
                      );
                    }
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary rounded text-meta font-medium transition-colors"
                  title="Buka Codeforces di jendela samping mandiri tanpa batasan browser"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Jendela Samping (Popout)</span>
                </button>
                <a
                  href="https://codeforces.com/problemset"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-2 py-1 bg-surface hover:bg-elevated border border-border-def text-slate-300 hover:text-white rounded text-meta font-medium transition-colors"
                  title="Buka langsung di tab baru browser"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="hidden sm:inline">Tab Baru</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowIframeOption((prev) => !prev)}
                  className={`px-2 py-1 rounded text-meta font-mono transition-colors border ${
                    showIframeOption
                      ? "bg-slate-700 text-white border-slate-500"
                      : "bg-surface text-slate-400 border-border-def hover:text-slate-200"
                  }`}
                  title="Tampilkan penampil URL iframe mentah"
                >
                  Iframe
                </button>
              </div>
            </div>


            {/* Search & Filter Toolbar */}
            <div className="p-3 space-y-2 border-b border-border-def bg-root/70 shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cfSearch}
                    onChange={(e) => setCfSearch(e.target.value)}
                    placeholder="Cari kode soal (misal: 4A, 71A) atau nama soal..."
                    className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border-def rounded text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary"
                  />
                  {cfSearch && (
                    <button
                      onClick={() => setCfSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Rating Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-meta no-scrollbar">
                <span className="text-[11px] text-slate-400 font-mono shrink-0">Rating:</span>
                {(["ALL", 800, 900, 1000, 1200, 1400, 1600, 1800] as const).map((r) => {
                  const isSelected = cfRatingFilter === r;
                  const label = r === "ALL" ? "Semua" : r === 1800 ? "1800+" : String(r);
                  return (
                    <button
                      key={String(r)}
                      onClick={() => setCfRatingFilter(r)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono shrink-0 transition-colors border ${
                        isSelected
                          ? "bg-primary text-white border-primary"
                          : "bg-surface border-border-def text-slate-400 hover:text-slate-200 hover:bg-elevated"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Tags Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-meta no-scrollbar">
                <span className="text-[11px] text-slate-400 font-mono shrink-0">Topik:</span>
                {(
                  [
                    "ALL",
                    "implementation",
                    "math",
                    "greedy",
                    "dp",
                    "strings",
                    "data structures",
                    "brute force",
                  ] as const
                ).map((t) => {
                  const isSelected = cfTagFilter === t;
                  const label = t === "ALL" ? "Semua" : t;
                  return (
                    <button
                      key={t}
                      onClick={() => setCfTagFilter(t)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono shrink-0 transition-colors border ${
                        isSelected
                          ? "bg-primary-muted text-primary border-primary/40 font-medium"
                          : "bg-surface border-border-def text-slate-400 hover:text-slate-200 hover:bg-elevated"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Raw Iframe Section */}
            {showIframeOption && (
              <div className="p-2 bg-elevated border-b border-border-def space-y-1.5 shrink-0">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={customCfUrl}
                    onChange={(e) => setCustomCfUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setCfUrl(customCfUrl)}
                    className="flex-1 px-2.5 py-1 bg-root border border-border-def rounded text-meta font-mono text-slate-200 focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => setCfUrl(customCfUrl)}
                    className="px-2.5 py-1 bg-surface hover:bg-elevated border border-border-def text-slate-200 rounded text-meta font-medium"
                  >
                    Buka
                  </button>
                </div>
                <div className="text-[10px] text-amber-400/90 font-mono">
                  * Catatan: Situs dengan header X-Frame-Options tidak akan memuat di iframe ini.
                </div>
                <div className="h-40 w-full bg-white rounded overflow-hidden">
                  <iframe
                    src={cfUrl}
                    title="Codeforces Problemset Debug"
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                </div>
              </div>
            )}

            {/* Problemset List Table */}
            <div className="flex-1 overflow-y-auto p-3">
              {isLoadingProblemset && problemsetList.length === 0 ? (
                <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-xs">Mengambil katalog soal resmi dari Codeforces...</span>
                </div>
              ) : (
                (() => {
                  const filtered = problemsetList.filter((p) => {
                    if (debouncedCfSearch.trim()) {
                      const q = debouncedCfSearch.trim().toLowerCase();
                      const matchId = p.id.toLowerCase().includes(q);
                      const matchName = p.name.toLowerCase().includes(q);
                      if (!matchId && !matchName) return false;
                    }
                    if (cfRatingFilter !== "ALL") {
                      if (cfRatingFilter === 1800) {
                        if (!p.rating || p.rating < 1800) return false;
                      } else {
                        if (p.rating !== cfRatingFilter) return false;
                      }
                    }
                    if (cfTagFilter !== "ALL") {
                      if (!p.tags.some((t) => t.toLowerCase().includes(cfTagFilter.toLowerCase())))
                        return false;
                    }
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-16 text-slate-500 text-xs">
                        Tidak ada soal yang cocok dengan filter pencarian &amp; rating.
                      </div>
                    );
                  }

                  const displayed = filtered.slice(0, visibleProblemCount);

                  return (
                    <div className="space-y-2">
                      <div className="text-[11px] text-slate-400 font-mono px-1 flex items-center justify-between">
                        <span>
                          Menampilkan {displayed.length} dari {filtered.length} soal Codeforces
                        </span>
                        {isLoadingProblemset && (
                          <span className="text-primary flex items-center space-x-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Sinkronisasi API...</span>
                          </span>
                        )}
                      </div>

                      <div className="border border-border-def rounded overflow-hidden divide-y divide-border-def">
                        {displayed.map((p) => (
                          <div
                            key={p.id}
                            className="p-2.5 bg-surface hover:bg-elevated transition-colors flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                              <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-root border border-border-def text-primary shrink-0">
                                {p.id}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-slate-200 truncate" title={p.name}>
                                  {p.name}
                                </div>
                                <div className="flex items-center space-x-1.5 mt-0.5 overflow-hidden">
                                  <span
                                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${getRatingBadgeStyle(
                                      p.rating
                                    )}`}
                                  >
                                    {p.rating ? `Rating ${p.rating}` : "Unrated"}
                                  </span>
                                  {p.tags.slice(0, 2).map((tg) => (
                                    <span
                                      key={tg}
                                      className="text-[10px] text-slate-400 bg-root px-1.5 py-0.2 rounded border border-border-def/60 truncate"
                                    >
                                      {tg}
                                    </span>
                                  ))}
                                  {p.tags.length > 2 && (
                                    <span className="text-[10px] text-slate-500">
                                      +{p.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0">
                              <button
                                onClick={() => handleLoadProblemToPlayground(p)}
                                disabled={isAdding}
                                className="px-2.5 py-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded text-meta font-medium transition-colors"
                                title={`Muat soal ${p.id} ke lembar kerja editor`}
                              >
                                + Muat ke Playground
                              </button>
                              <a
                                href={`https://codeforces.com/contest/${p.contest_id}/problem/${p.index}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-slate-400 hover:text-white rounded hover:bg-root transition-colors"
                                title="Buka deskripsi di Codeforces resmi (tab baru)"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>

                      {visibleProblemCount < filtered.length && (
                        <div className="pt-2 text-center">
                          <button
                            type="button"
                            onClick={() => setVisibleProblemCount((prev) => prev + 35)}
                            className="w-full py-2 bg-surface hover:bg-elevated border border-border-def hover:border-primary/50 text-slate-300 hover:text-white text-xs font-mono rounded transition-colors"
                          >
                            Muat 35 Soal Berikutnya ({filtered.length - visibleProblemCount} tersisa)
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Pane: Monaco Workspace & Test Runner */}
      <div className="w-full md:w-1/2 h-full flex flex-col bg-surface overflow-hidden">
        {/* Right Pane Header: Language Toggle & Execution Controls */}
        <div className="p-2 bg-elevated border-b border-border-def flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-primary" />
            <div className="flex border border-border-def rounded overflow-hidden">
              <button
                onClick={() => setProgLanguage("cpp")}
                className={`px-2.5 py-1 text-meta font-mono font-medium transition-colors ${
                  progLanguage === "cpp"
                    ? "bg-primary text-white"
                    : "bg-surface text-slate-400 hover:text-slate-200"
                }`}
              >
                C++ (g++ 17)
              </button>
              <button
                onClick={() => setProgLanguage("python")}
                className={`px-2.5 py-1 text-meta font-mono font-medium transition-colors ${
                  progLanguage === "python"
                    ? "bg-primary text-white"
                    : "bg-surface text-slate-400 hover:text-slate-200"
                }`}
              >
                Python 3
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetCode}
              className="flex items-center space-x-1 px-2 py-1 bg-surface hover:bg-elevated border border-border-def rounded text-label text-slate-400 hover:text-slate-200 transition-colors"
              title="Reset kode template"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleRunTests}
              disabled={isRunning || !problem}
              className="flex items-center space-x-1.5 px-3 py-1 bg-primary hover:bg-primary-hover text-white rounded text-label font-medium transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? "Menguji..." : "Jalankan Solusi"}</span>
            </button>
          </div>
        </div>

        {/* Monaco Editor (collapses when terminal is fullscreen) */}
        <div
          className={`${
            terminalSize === "fullscreen" ? "hidden" : "flex-1 min-h-[140px]"
          } relative border-b border-border-def`}
        >
          <Editor
            height="100%"
            language={progLanguage === "cpp" ? "cpp" : "python"}
            value={progLanguage === "cpp" ? cppCode : pythonCode}
            onChange={(val) => {
              if (progLanguage === "cpp") {
                setCppCode(val || "");
              } else {
                setPythonCode(val || "");
              }
            }}
            onMount={handleEditorMount}
            options={{
              fontSize: 13,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              minimap: { enabled: false },
              lineNumbers: "on",
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: 4,
              padding: { top: 8, bottom: 8 },
            }}
          />
        </div>

        {/* Output Console & Terminal with Adjustable Height */}
        <div className={`${terminalHeightClass} bg-root flex flex-col transition-all duration-150`}>
          {/* Sub-Tabs & Size Controls Header */}
          <div className="px-3 py-1.5 bg-elevated border-b border-border-def flex items-center justify-between text-meta">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab("SAMPLES")}
                className={`px-2 py-0.5 rounded font-mono ${
                  activeTab === "SAMPLES"
                    ? "bg-surface text-primary border border-primary/30"
                    : "text-slate-400"
                }`}
              >
                Sample Tests
              </button>
              <button
                onClick={() => setActiveTab("CUSTOM")}
                className={`px-2 py-0.5 rounded font-mono ${
                  activeTab === "CUSTOM"
                    ? "bg-surface text-primary border border-primary/30"
                    : "text-slate-400"
                }`}
              >
                Custom Input
              </button>

              {result && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded font-mono font-semibold ${
                    result.all_passed
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-rose-950 text-rose-400 border border-rose-800"
                  }`}
                >
                  {result.verdict} ({result.total_time_ms} ms)
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {result && !result.all_passed && (
                <button
                  onClick={handleAskAiForVerdict}
                  className="flex items-center space-x-1 text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bantuan AI Tutor</span>
                </button>
              )}

              {/* Terminal Height Control Presets */}
              <div className="flex items-center space-x-0.5 border border-border-def rounded px-1 py-0.5 bg-root">
                <span className="text-meta text-slate-500 mr-1 font-mono hidden sm:inline">
                  Terminal:
                </span>
                <button
                  onClick={() => setTerminalSize("compact")}
                  className={`px-1.5 py-0.5 rounded text-meta font-mono ${
                    terminalSize === "compact"
                      ? "bg-surface text-primary font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Kompak (180px)"
                >
                  180px
                </button>
                <button
                  onClick={() => setTerminalSize("standard")}
                  className={`px-1.5 py-0.5 rounded text-meta font-mono ${
                    terminalSize === "standard"
                      ? "bg-surface text-primary font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Standar (300px)"
                >
                  300px
                </button>
                <button
                  onClick={() => setTerminalSize("large")}
                  className={`px-1.5 py-0.5 rounded text-meta font-mono ${
                    terminalSize === "large"
                      ? "bg-surface text-primary font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Besar (450px)"
                >
                  450px
                </button>
                <button
                  onClick={() =>
                    setTerminalSize(terminalSize === "fullscreen" ? "standard" : "fullscreen")
                  }
                  className={`p-1 rounded text-meta ${
                    terminalSize === "fullscreen"
                      ? "bg-surface text-primary"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title={terminalSize === "fullscreen" ? "Kecilkan Terminal" : "Maksimalkan Terminal"}
                >
                  {terminalSize === "fullscreen" ? (
                    <Minimize2 className="w-3 h-3" />
                  ) : (
                    <Maximize2 className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto font-mono text-label text-slate-300">
            {activeTab === "CUSTOM" && (
              <div className="h-full flex flex-col space-y-1">
                <span className="text-meta text-slate-500">Masukkan data stdin pengujian manual:</span>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Contoh: 8"
                  className="flex-1 p-2 bg-surface border border-border-def rounded text-slate-200 resize-none font-mono text-label focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {activeTab === "SAMPLES" && (
              <>
                {!result && !isRunning && (
                  <div className="text-slate-500 space-y-1 text-meta">
                    <p className="italic">
                      Tulis kode solusi Anda dalam {progLanguage === "cpp" ? "C++ (g++ 17)" : "Python 3"} dan tekan "Jalankan Solusi" (atau Ctrl+Enter).
                    </p>
                    <p className="text-slate-600">
                      Gunakan tab "Web Codeforces" di sebelah kiri untuk melihat daftar soal langsung dari codeforces.com.
                    </p>
                  </div>
                )}
                {isRunning && (
                  <p className="text-primary animate-pulse flex items-center space-x-2">
                    <Terminal className="w-4 h-4 animate-spin" />
                    <span>
                      Mengompilasi dan menguji solusi {progLanguage === "cpp" ? "C++" : "Python"}...
                    </span>
                  </p>
                )}
                {result && (
                  <div className="space-y-3">
                    {/* Compilation Error Diagnostics */}
                    {result.verdict === "COMPILATION_ERROR" && (
                      <div className="p-3 bg-rose-950/30 border border-rose-800/60 rounded font-mono text-meta text-rose-300 space-y-2">
                        <div className="flex items-center space-x-1.5 font-semibold text-rose-400">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Compilation Error ({progLanguage === "cpp" ? "g++" : "Python"}):</span>
                        </div>
                        <pre className="whitespace-pre-wrap p-2 bg-root rounded border border-border-def text-slate-200 overflow-x-auto text-xs">
                          {result.results?.[0]?.error_message || "Gagal mengompilasi kode."}
                        </pre>
                      </div>
                    )}

                    {/* Test Case Results */}
                    {result.results?.map((res: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-2.5 border rounded space-y-1.5 ${
                          res.passed
                            ? "bg-emerald-950/20 border-emerald-800/40"
                            : "bg-rose-950/20 border-rose-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between text-meta">
                          <span className="font-semibold text-slate-200">
                            Kasus Uji #{res.case_number}
                          </span>
                          <span className={res.passed ? "text-emerald-400" : "text-rose-400"}>
                            {res.passed ? "PASSED" : "FAILED"} ({res.execution_time_ms} ms)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-meta">
                          <div>
                            <span className="text-slate-500 block">Keluaran Diharapkan:</span>
                            <pre className="p-1 bg-surface rounded text-slate-300 whitespace-pre-wrap">
                              {res.expected_output}
                            </pre>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Keluaran Program:</span>
                            <pre
                              className={`p-1 bg-surface rounded whitespace-pre-wrap ${
                                res.passed ? "text-emerald-300" : "text-rose-300"
                              }`}
                            >
                              {res.actual_output || res.error_message || "(Kosong)"}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
