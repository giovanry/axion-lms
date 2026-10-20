"use client";

import React, { useState } from "react";
import {
  BrainCircuit,
  Sparkles,
  Send,
  Trash2,
  Lightbulb,
  HelpCircle,
  Code,
  Sigma,
  AlertCircle,
  Tag,
  Check,
} from "lucide-react";
import { useAxionStore, AiCognitiveMode } from "@/stores/useAxionStore";

export const Zona4SocraticTutor: React.FC = () => {
  const {
    aiMode,
    setAiMode,
    chatHistory,
    addChatMessage,
    clearChat,
    isAiThinking,
    setIsAiThinking,
    activeBadges,
    aiStatus,
    activeLesson,
    activeLessonId,
  } = useAxionStore();

  const [inputPrompt, setInputPrompt] = useState("");
  const [activeCellBadge, setActiveCellBadge] = useState(true);
  const [activeVideoBadge, setActiveVideoBadge] = useState(true);

  const handleSendMessage = async () => {
    if (!inputPrompt.trim()) return;

    const userText = inputPrompt;
    setInputPrompt("");

    // 1. Add User Message
    addChatMessage({
      sender: "user",
      text: userText,
    });

    // 2. Query Socratic AI Backend (Gemini 3.6 Flash / Ollama)
    setIsAiThinking(true);
    try {
      const historyPayload = chatHistory.slice(-6).map((m) => ({
        role: m.sender === "user" ? "user" : "gemini",
        text: m.text,
      }));

      const res = await fetch("/api/v1/ai/socratic-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          mode: aiMode,
          lesson_id: activeLessonId,
          lesson_title: activeLesson?.title,
          track_title: activeLesson?.track_title,
          active_code: activeLesson?.starter_code,
          video_timestamp: "02:15",
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      addChatMessage({
        sender: data.provider === "ollama" ? "ollama" : "gemini",
        text: data.reply || "Maaf, respon AI kosong.",
        isHint: aiMode === "SOCRATIC_DEBUGGER",
      });
    } catch (err: any) {
      console.warn("Socratic AI fetch error:", err);
      // Graceful local heuristic
      addChatMessage({
        sender: "gemini",
        text: "Tinjauan Socratic (Offline Fallback): Periksa keselarasan dimensi tensor pada operasi Anda. Perhatikan bahwa perkalian titik memerlukan dimensi dalam yang sama $(M \\times K) \\cdot (K \\times N)$.",
        isHint: true,
      });
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 overflow-hidden">
      {/* Top Header */}
      <div className="h-9 px-3 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[12px] font-medium text-zinc-200">Socratic AI Tutor</span>
        </div>

        <button
          onClick={clearChat}
          title="Bersihkan Percakapan"
          className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Cognitive Persona Switcher */}
      <div className="p-2 border-b border-zinc-800/80 bg-zinc-900/30 shrink-0">
        <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded border border-zinc-800 text-[10.5px] font-medium">
          <button
            onClick={() => setAiMode("SOCRATIC_DEBUGGER")}
            className={`py-1 px-1.5 rounded text-center truncate transition-colors ${
              aiMode === "SOCRATIC_DEBUGGER"
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            Socratic Debug
          </button>

          <button
            onClick={() => setAiMode("MATH_TO_CODE")}
            className={`py-1 px-1.5 rounded text-center truncate transition-colors ${
              aiMode === "MATH_TO_CODE"
                ? "bg-amber-600 text-white"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            Math-to-Code
          </button>

          <button
            onClick={() => setAiMode("EKKA_OSN_EXAMINER")}
            className={`py-1 px-1.5 rounded text-center truncate transition-colors ${
              aiMode === "EKKA_OSN_EXAMINER"
                ? "bg-emerald-600 text-white"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            OSN Examiner
          </button>
        </div>
      </div>

      {/* Active Context Badges */}
      <div className="px-3 py-1.5 border-b border-zinc-800/60 bg-zinc-900/20 flex flex-wrap gap-1.5 text-[10px] font-mono shrink-0">
        {activeCellBadge && (
          <button
            onClick={() => setActiveCellBadge(!activeCellBadge)}
            title="Klik untuk menonaktifkan konteks kode sel aktif"
            className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
          >
            <Tag className="w-2.5 h-2.5 text-indigo-400" />
            <span>Sel: In[1] normalize_features</span>
          </button>
        )}

        {activeVideoBadge && (
          <button
            onClick={() => setActiveVideoBadge(!activeVideoBadge)}
            title="Klik untuk menonaktifkan konteks video"
            className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-zinc-850 border border-zinc-700/60 text-zinc-300"
          >
            <Tag className="w-2.5 h-2.5 text-zinc-400" />
            <span>YouTube: 02:15</span>
          </button>
        )}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chatHistory.map((msg) => {
          if (msg.sender === "system") {
            return (
              <div
                key={msg.id}
                className="p-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-start space-x-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            );
          }

          if (msg.sender === "user") {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] rounded bg-indigo-600 px-3 py-2 text-[12px] text-white leading-relaxed">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex justify-start">
              <div
                className={`max-w-[92%] rounded border p-3 text-[12px] leading-relaxed space-y-1.5 ${
                  msg.isHint
                    ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                    : "bg-zinc-900 border-zinc-800 text-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pb-1 border-b border-zinc-800/60">
                  <span className="text-indigo-400 font-semibold flex items-center space-x-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Gemini 3.6 Socratic Tutor</span>
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <p>{msg.text}</p>
              </div>
            </div>
          );
        })}

        {isAiThinking && (
          <div className="flex items-center space-x-2 text-[11px] font-mono text-indigo-400 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>Gemini sedang menganalisis dimensi & alur logika...</span>
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      <div className="p-2 border-t border-zinc-800/80 bg-zinc-950 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder={
              aiMode === "SOCRATIC_DEBUGGER"
                ? "Tanyakan petunjuk error atau konsep matriks..."
                : aiMode === "MATH_TO_CODE"
                ? "Masukkan rumus matematika untuk diterjemahkan..."
                : "Minta pertanyaan latihan olimpiade AI..."
            }
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded pl-3 pr-10 py-2 text-[12px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-sans"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim()}
            title="Kirim pesan"
            className="absolute right-1.5 p-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500 px-1 font-mono">
          <span>Anti-Spoiler Guard: Aktif</span>
          <span>Google Gemini 3.6 Flash</span>
        </div>
      </div>
    </div>
  );
};
