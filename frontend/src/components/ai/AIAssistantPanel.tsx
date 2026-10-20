"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING_SNAPPY, SPRING_BOUNCY, SPRING_SMOOTH } from "@/lib/motion-config";
import {
  AlertCircle,
  Bot,
  BrainCircuit,
  Code,
  Minimize2,
  RefreshCw,
  Send,
  Sigma,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useLmsStore } from "@/stores/useLmsStore";

type CognitiveMode = "SOCRATIC_DEBUGGER" | "MATH_TO_CODE" | "EKKA_OSN_EXAMINER";

export const AIAssistantPanel: React.FC = () => {
  const { isAiDrawerOpen, toggleAiDrawer, aiContext, activeLessonId, activeLesson } = useLmsStore();
  const [messages, setMessages] = useState<Array<{ sender: "user" | "tutor"; text: string; isHint?: boolean }>>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [inputQuestion, setInputQuestion] = useState<string>("");
  const [cognitiveMode, setCognitiveMode] = useState<CognitiveMode>("SOCRATIC_DEBUGGER");
  const [activeModel, setActiveModel] = useState<string>("gemini-3.6-flash");

  useEffect(() => {
    if (aiContext?.errorOutput) {
      toggleAiDrawer(true);
      handleExplainError(aiContext.code || "", aiContext.errorOutput, aiContext.title);
    }
  }, [aiContext?.errorOutput]);

  const handleExplainError = async (codeSnippet: string, errorOutput: string, title?: string) => {
    setIsStreaming(true);
    const userMsg = `Saya mengalami error berikut:\n${errorOutput}`;
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMsg },
    ]);

    try {
      const res = await fetch("/api/v1/ai/socratic-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Bantu saya menganalisis penyebab error berikut secara Socratic tanpa membocorkan kodenya: "${errorOutput}"`,
          mode: "SOCRATIC_DEBUGGER",
          lesson_id: activeLessonId,
          lesson_title: title || activeLesson?.title,
          active_code: codeSnippet,
          error_traceback: errorOutput,
          transcript_context: aiContext?.transcriptContext,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setActiveModel(data.model || "gemini-3.6-flash");
      setMessages((prev) => [
        ...prev,
        { sender: "tutor", text: data.reply || "Analisis selesai.", isHint: true },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "tutor",
          text: "Petunjuk Socratic: Periksa dimensi array dan aturan penyiaran (broadcasting) sebelum melakukan operasi. Pastikan matriks memiliki shape yang kompatibel.",
          isHint: true,
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSendPrompt = async () => {
    if (!inputQuestion.trim() || isStreaming) return;
    const userPrompt = inputQuestion.trim();
    setInputQuestion("");

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userPrompt },
    ]);
    setIsStreaming(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === "user" ? "user" : "gemini",
        text: m.text,
      }));

      const res = await fetch("/api/v1/ai/socratic-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          mode: cognitiveMode,
          lesson_id: activeLessonId,
          lesson_title: activeLesson?.title,
          active_code: aiContext?.code || activeLesson?.starter_code,
          error_traceback: aiContext?.errorOutput,
          transcript_context: aiContext?.transcriptContext,
          history: historyPayload,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setActiveModel(data.model || "gemini-3.6-flash");
      setMessages((prev) => [
        ...prev,
        {
          sender: "tutor",
          text: data.reply || "Jawaban kosong dari AI.",
          isHint: cognitiveMode === "SOCRATIC_DEBUGGER",
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "tutor",
          text: "Petunjuk: Perhatikan kembali formulasi matematika dari operasi ini. Coba cetak shape setiap variabel dengan `.shape` untuk melacak inkonsistensi dimensi.",
          isHint: true,
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isAiDrawerOpen ? (
        <motion.button
          key="ai-fab-bubble"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={SPRING_BOUNCY}
          onClick={() => toggleAiDrawer(true)}
          className="group fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 bg-surface/95 hover:bg-surface border border-primary/50 hover:border-primary text-slate-100 rounded-full shadow-2xl shadow-primary/30 backdrop-blur-md cursor-pointer"
          title="Buka Socratic AI Tutor (Gemini 3.6)"
          aria-label="Buka AI Tutor"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5" />
            <Bot className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
          </div>
          <span className="font-semibold text-label text-slate-100 font-mono tracking-tight hidden sm:inline">
            AI Tutor (Gemini 3.6)
          </span>
        </motion.button>
      ) : (
        <motion.aside
          key="ai-assistant-modal"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={SPRING_SNAPPY}
          aria-label="Axion Socratic AI Tutor Panel"
          className="fixed bottom-6 right-6 w-[380px] md:w-[440px] max-h-[85vh] h-[580px] bg-surface border border-border-def rounded-xl z-50 flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="h-11 px-3.5 bg-elevated border-b border-border-def flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <span className="text-label text-slate-100 font-semibold block leading-tight">
                  Socratic AI Tutor
                </span>
                <span className="text-[10px] text-emerald-400 font-mono block">
                  Gemini 3.6 Flash • Anti-Spoiler Aktif
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                transition={SPRING_SNAPPY}
                onClick={() => setMessages([])}
                title="Bersihkan Percakapan"
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-surface transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                transition={SPRING_SNAPPY}
                onClick={() => toggleAiDrawer(false)}
                aria-label="Kecilkan ke Bubble"
                title="Kecilkan ke Bubble"
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-surface transition-colors"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                transition={SPRING_SNAPPY}
                onClick={() => toggleAiDrawer(false)}
                aria-label="Tutup Panel AI"
                title="Tutup Panel AI"
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-surface transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>

          {/* Cognitive Mode Switcher Chips with Shared Layout Sliding Pill */}
          <div className="px-3 py-1.5 bg-root border-b border-border-def shrink-0">
            <div className="grid grid-cols-3 gap-1 text-[10.5px] font-mono relative">
              <button
                onClick={() => setCognitiveMode("SOCRATIC_DEBUGGER")}
                className={`relative py-1 px-1.5 rounded text-center truncate transition-colors z-10 ${
                  cognitiveMode === "SOCRATIC_DEBUGGER"
                    ? "text-white font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cognitiveMode === "SOCRATIC_DEBUGGER" && (
                  <motion.div
                    layoutId="ai-cognitive-mode-pill"
                    className="absolute inset-0 bg-primary rounded shadow-sm -z-10"
                    transition={SPRING_SNAPPY}
                  />
                )}
                Socratic Debug
              </button>
              <button
                onClick={() => setCognitiveMode("MATH_TO_CODE")}
                className={`relative py-1 px-1.5 rounded text-center truncate transition-colors z-10 ${
                  cognitiveMode === "MATH_TO_CODE"
                    ? "text-white font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cognitiveMode === "MATH_TO_CODE" && (
                  <motion.div
                    layoutId="ai-cognitive-mode-pill"
                    className="absolute inset-0 bg-amber-600 rounded shadow-sm -z-10"
                    transition={SPRING_SNAPPY}
                  />
                )}
                Math-to-Code
              </button>
              <button
                onClick={() => setCognitiveMode("EKKA_OSN_EXAMINER")}
                className={`relative py-1 px-1.5 rounded text-center truncate transition-colors z-10 ${
                  cognitiveMode === "EKKA_OSN_EXAMINER"
                    ? "text-white font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cognitiveMode === "EKKA_OSN_EXAMINER" && (
                  <motion.div
                    layoutId="ai-cognitive-mode-pill"
                    className="absolute inset-0 bg-emerald-600 rounded shadow-sm -z-10"
                    transition={SPRING_SNAPPY}
                  />
                )}
                OSN Examiner
              </button>
            </div>
          </div>

          {/* Active Context Badges */}
          {(activeLesson?.title || aiContext?.transcriptContext) && (
            <div className="px-3 py-1 bg-surface border-b border-border-def/60 flex items-center gap-1.5 text-[10px] font-mono text-slate-400 shrink-0 overflow-x-auto">
              <Tag className="w-2.5 h-2.5 text-primary shrink-0" />
              <span className="truncate">{activeLesson?.title || "Materi Aktif"}</span>
              {aiContext?.transcriptContext && (
                <span className="text-emerald-400 bg-emerald-950/60 px-1 rounded shrink-0">
                  Transkrip Video Terhubung
                </span>
              )}
            </div>
          )}

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {messages.length === 0 && (
              <div className="p-4 bg-surface border border-border-def rounded-lg text-center text-meta text-slate-400 space-y-2 mt-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <p className="text-body font-semibold text-slate-200">Socratic AI Tutor Siap Membimbing</p>
                <p className="text-meta text-slate-400 leading-relaxed">
                  Tanyakan logika aljabar linear, penyiaran NumPy, atau minta analisis error tanpa membocorkan kode jawaban.
                </p>
              </div>
            )}

            {messages.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={SPRING_SNAPPY}
                className={`p-3 rounded-lg text-body ${
                  m.sender === "user"
                    ? "bg-elevated border border-border-def text-slate-200 ml-6"
                    : m.isHint
                    ? "bg-amber-950/20 border border-amber-500/40 text-amber-200 mr-4 space-y-1"
                    : "bg-surface border border-primary/30 text-slate-100 mr-4 space-y-1 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1 border-b border-border-def/40 pb-0.5">
                  <span>{m.sender === "user" ? "Anda" : `Socratic AI (${activeModel})`}</span>
                  {m.isHint && <span className="text-amber-400">Anti-Spoiler Hint</span>}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-[12px]">{m.text}</div>
              </motion.div>
            ))}

            {isStreaming && (
              <div className="flex items-center space-x-2 text-meta text-primary font-mono p-2 bg-primary/10 rounded border border-primary/20">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Gemini 3.6 Flash sedang menganalisis logika & dimensi...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-elevated border-t border-border-def flex items-center space-x-2 shrink-0">
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendPrompt()}
              placeholder={
                cognitiveMode === "SOCRATIC_DEBUGGER"
                  ? "Tanyakan petunjuk error atau konsep matriks..."
                  : cognitiveMode === "MATH_TO_CODE"
                  ? "Masukkan rumus matematika untuk diterjemahkan..."
                  : "Minta pertanyaan tantangan olimpiade AI..."
              }
              className="flex-1 px-3 py-2 bg-root border border-border-def rounded text-label text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary font-sans"
            />
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={SPRING_SNAPPY}
              onClick={handleSendPrompt}
              disabled={isStreaming || !inputQuestion.trim()}
              className="p-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded text-label transition-colors"
              aria-label="Kirim Pesan"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
