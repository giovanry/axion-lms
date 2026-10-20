"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING_SNAPPY, EASE_OUT_EXPO } from "@/lib/motion-config";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { useLmsStore } from "@/stores/useLmsStore";

// Helper to ensure LaTeX expressions are correctly formatted and rendered
const formatQuizLatex = (rawText: string): string => {
  if (!rawText) return "";
  const text = rawText.trim();
  if (text.includes("$")) return text;

  // Auto-wrap Big-O notation: O(1), O(N), O(log N), O(N^2)
  let result = text.replace(/\bO\(([^)]+)\)/g, "$\\mathcal{O}($1)$");

  // Auto-wrap math equations with Greek letters or exponents
  if (
    result.includes("y_hat") ||
    result.includes("sigma") ||
    result.includes("dL/dw") ||
    result.includes("\\alpha") ||
    result.includes("^2") ||
    result.includes("\\cdot")
  ) {
    const mathExpr = result
      .replace(/y_hat/g, "\\hat{y}")
      .replace(/sigma'/g, "\\sigma'")
      .replace(/sigma/g, "\\sigma")
      .replace(/dL\/dw/g, "\\frac{\\partial \\mathcal{L}}{\\partial w}")
      .replace(/\s*\*\s*/g, " \\cdot ")
      .replace(/1\/2/g, "\\frac{1}{2}")
      .replace(/x\^2/g, "x^2");
    return `$${mathExpr}$`;
  }

  return result;
};

export const QuizViewer: React.FC = () => {
  const { activeLesson, setUserStats } = useLmsStore();
  const quiz = activeLesson?.quiz;

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!quiz) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center text-slate-400 bg-surface border-l border-border-def">
        <div>
          <HelpCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-body text-slate-300">Pelajaran ini tidak memiliki kuis teori.</p>
          <p className="text-meta text-slate-500">Pindah ke tab kode atau catatan untuk melanjutkan.</p>
        </div>
      </div>
    );
  }

  const isCorrect = selectedOption === quiz.correct_index;

  const handleOptionSelect = (index: number) => {
    if (submitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = async () => {
    if (selectedOption === null) return;
    setSubmitted(true);

    if (selectedOption === quiz.correct_index && activeLesson) {
      try {
        const res = await fetch(`/api/v1/lessons/${activeLesson.id}/complete`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setUserStats({
            id: 1,
            name: "Olympus Scholar",
            daily_streak: data.daily_streak,
            last_active_date: new Date().toISOString().slice(0, 10),
          });
        }
      } catch (err) {
        console.error("Failed to complete lesson on quiz success:", err);
      }
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setSubmitted(false);
  };

  return (
    <div className="h-full flex flex-col bg-surface border-l border-border-def p-6 overflow-y-auto space-y-6">
      <div>
        <span className="text-meta text-primary font-mono block mb-1">EVALUASI TEORI AI (TRACK 1)</span>
        <h3 className="text-section-header text-slate-100">Uji Pemahaman Konsep</h3>
      </div>

      {/* Question rendering with LaTeX */}
      <div className="p-4 bg-root border border-border-def rounded">
        <div className="text-body text-slate-200">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({ children }) => <p className="text-body text-slate-200 leading-relaxed mb-0">{children}</p>,
            }}
          >
            {formatQuizLatex(quiz.question)}
          </ReactMarkdown>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {quiz.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          let borderClass = "border-border-def hover:border-slate-500";
          let bgClass = "bg-elevated";

          if (isSelected) {
            borderClass = "border-primary bg-primary-muted/30";
          }

          if (submitted) {
            if (idx === quiz.correct_index) {
              borderClass = "border-emerald-500 bg-emerald-950/40 text-emerald-300";
            } else if (isSelected && !isCorrect) {
              borderClass = "border-rose-500 bg-rose-950/40 text-rose-300";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionSelect(idx)}
              disabled={submitted}
              className={`w-full text-left p-3.5 border rounded transition-colors flex items-start space-x-3 cursor-pointer ${bgClass} ${borderClass}`}
            >
              <span className="w-5 h-5 rounded-full border border-border-strong flex items-center justify-center font-mono text-meta text-slate-300 mt-0.5 shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <div className="flex-1 text-body text-slate-200">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    p: ({ children }) => <span className="inline leading-relaxed">{children}</span>,
                  }}
                >
                  {formatQuizLatex(option)}
                </ReactMarkdown>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback Panel with Fade In Out */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={SPRING_SNAPPY}
            className={`p-4 border rounded space-y-2 ${
              isCorrect
                ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-200"
                : "bg-rose-950/30 border-rose-800/60 text-rose-200"
            }`}
          >
            <div className="flex items-center space-x-2 font-medium text-section-header">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Jawaban Benar! Pelajaran Selesai.</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Jawaban Kurang Tepat</span>
                </>
              )}
            </div>
            <div className="text-body text-slate-300">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({ children }) => <p className="text-body text-slate-300 leading-relaxed mb-0">{children}</p>,
                }}
              >
                {formatQuizLatex(quiz.explanation)}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-2">
        {submitted && !isCorrect && (
          <button
            onClick={handleRetry}
            className="px-4 py-1.5 bg-elevated hover:bg-surface border border-border-def rounded text-label text-slate-300 hover:text-white transition-colors"
          >
            Coba Lagi
          </button>
        )}
        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className="px-5 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded text-label font-medium transition-colors"
          >
            Kirim Jawaban
          </button>
        )}
      </div>
    </div>
  );
};
