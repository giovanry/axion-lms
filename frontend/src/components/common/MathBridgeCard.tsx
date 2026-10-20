"use client";

import React, { useState } from "react";
import { ArrowRight, Copy, Check, Terminal, Sigma } from "lucide-react";
import { useAxionStore } from "@/stores/useAxionStore";

interface MathBridgeCardProps {
  conceptName: string;
  latexFormula: string;
  tensorDimensions: string;
  pythonCode: string;
  explanation: string;
}

export const MathBridgeCard: React.FC<MathBridgeCardProps> = ({
  conceptName,
  latexFormula,
  tensorDimensions,
  pythonCode,
  explanation,
}) => {
  const [copied, setCopied] = useState(false);
  const { notebookCells } = useAxionStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToEditor = () => {
    // Injects code directly into active Monaco cell
    const activeCell = notebookCells[0];
    if (activeCell) {
      activeCell.code = activeCell.code + "\n\n# Implementasi: " + conceptName + "\n" + pythonCode;
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-4 rounded border border-amber-500/30 bg-zinc-950/80 overflow-hidden shadow-sm">
      {/* Card Header with Amber Accent (Math-to-Code) */}
      <div className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sigma className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-mono font-semibold text-amber-300">
            MATH-TO-CODE BRIDGE
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-[11px] text-zinc-300 font-medium">{conceptName}</span>
        </div>

        <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
          Dimensi: {tensorDimensions}
        </span>
      </div>

      {/* Two-Column Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800/80">
        {/* Left Column: Mathematical Formula */}
        <div className="p-3 bg-zinc-900/40 space-y-2">
          <div className="text-[10px] font-mono text-zinc-500">FORMULA MATEMATIKA (KATEX)</div>
          <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-center font-mono text-zinc-100 text-[13px] overflow-x-auto">
            {latexFormula}
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">{explanation}</p>
        </div>

        {/* Right Column: Python Vectorized Implementation */}
        <div className="p-3 bg-zinc-900/20 space-y-2 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-500">VEKTORISASI PYTHON (NUMPY)</span>
              <button
                onClick={handleCopy}
                title="Salin Kode Python"
                className="text-[10px] font-mono flex items-center space-x-1 text-zinc-400 hover:text-zinc-200"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-2.5 rounded bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-emerald-400/90 overflow-x-auto leading-relaxed">
              <code>{pythonCode}</code>
            </pre>
          </div>

          <button
            onClick={handleSendToEditor}
            className="mt-2 w-full flex items-center justify-center space-x-1.5 py-1 px-2.5 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 text-[11px] font-medium transition-colors"
          >
            <Terminal className="w-3 h-3 text-indigo-400" />
            <span>Kirim ke Sel Editor (Zona 3)</span>
            <ArrowRight className="w-3 h-3 text-zinc-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
