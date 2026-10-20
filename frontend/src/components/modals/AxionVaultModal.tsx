"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  Key,
  Database,
  User,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Flame,
  Award,
  Sparkles,
} from "lucide-react";
import { useAxionStore } from "@/stores/useAxionStore";

export const AxionVaultModal: React.FC = () => {
  const { isVaultOpen, setVaultOpen, userProfile, setUserProfile, aiStatus, setAiStatus } =
    useAxionStore();

  const [geminiKey, setGeminiKey] = useState("");
  const [kaggleStatus, setKaggleStatus] = useState<string>("Memeriksa kredensial...");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Fetch real stats from backend on mount/open
  useEffect(() => {
    if (!isVaultOpen) return;

    fetch("/api/v1/user/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setUserProfile({
            name: data.name || "Axion Scholar",
            streakDays: data.daily_streak || 0,
            hoursLearned: data.hours_learned || 0,
            osnReadinessScore: data.osn_readiness_score || 50,
            kaggleConnected: data.has_kaggle || false,
          });
          setKaggleStatus(data.has_kaggle ? `Terhubung: ${data.kaggle_username}` : "Belum Dikonfigurasi");
        }
      })
      .catch((err) => console.warn("Could not fetch user stats:", err));
  }, [isVaultOpen, setUserProfile]);

  if (!isVaultOpen) return null;

  const handleTestGemini = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/v1/vault/test-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: geminiKey }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(`Berhasil! ${data.message}`);
        setAiStatus("ONLINE_GEMINI");
      } else {
        setTestResult(`Peringatan: ${data.error || "Gagal menghubungi Gemini API"}`);
      }
    } catch (e: any) {
      setTestResult(`Error: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDropKaggle = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.files || !e.dataTransfer.files[0]) return;

    const file = e.dataTransfer.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed.username || !parsed.key) {
          alert("File kaggle.json tidak valid (harus memuat username dan key).");
          return;
        }

        setIsUploading(true);
        const res = await fetch("/api/v1/vault/kaggle-json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: parsed.username,
            key: parsed.key,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setKaggleStatus(`Terhubung: ${data.username}`);
          setUserProfile({ kaggleConnected: true });
        }
      } catch (err) {
        alert("Gagal membaca file JSON.");
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-[14px] font-semibold text-zinc-100">
              Axion Vault & Credential Manager
            </span>
          </div>

          <button
            onClick={() => setVaultOpen(false)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Section 1: User Profile & Readiness Score */}
          <div className="p-3.5 rounded border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-mono text-[14px] font-bold">
                G
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[13px] font-semibold text-zinc-100">{userProfile.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.2 bg-emerald-500/10 rounded border border-emerald-500/20">
                    EKKA OSN Scholar
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Total Jam Belajar: {userProfile.hoursLearned} jam • Streak: {userProfile.streakDays} hari
                </div>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-[10px] text-zinc-500">EKKA OSN SCORE</div>
              <div className="text-[16px] font-bold text-indigo-400">
                {userProfile.osnReadinessScore}/100
              </div>
            </div>
          </div>

          {/* Section 2: Kaggle API Dropzone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium text-zinc-200 flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Kredensial Kaggle API (kaggle.json)</span>
              </label>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{kaggleStatus}</span>
              </span>
            </div>

            {/* Dropzone Box */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropKaggle}
              className="p-4 rounded border border-dashed border-zinc-700 hover:border-indigo-500/60 bg-zinc-900/20 text-center space-y-1.5 cursor-pointer transition-colors"
            >
              <Upload className="w-5 h-5 text-zinc-500 mx-auto" />
              <div className="text-[12px] text-zinc-300 font-medium">
                {isUploading ? (
                  <span className="text-indigo-400">Menyimpan kredensial ke lingkungan...</span>
                ) : (
                  <>
                    Drop your <code className="font-mono text-indigo-400">kaggle.json</code> file here
                  </>
                )}
              </div>
              <div className="text-[10px] text-zinc-500">
                Kredensial otomatis tersimpan ke ~/.kaggle/kaggle.json untuk unduhan dataset satu-klik.
              </div>
            </div>
          </div>

          {/* Section 3: Google Gemini API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium text-zinc-200 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Google Gemini API Key</span>
              </label>
              <span className="text-[11px] font-mono text-zinc-400">Model: gemini-3.6-flash</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-[12px] font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleTestGemini}
                disabled={isTesting}
                className="px-3 py-1.5 rounded bg-zinc-850 hover:bg-zinc-800 disabled:opacity-50 border border-zinc-700 text-zinc-200 text-[11px] font-medium transition-colors"
              >
                {isTesting ? "Testing..." : "Test Connection"}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-2 rounded border text-[11px] font-mono ${
                  testResult.includes("Berhasil")
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                    : "bg-rose-950/20 border-rose-500/30 text-rose-300"
                }`}
              >
                {testResult}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-end">
          <button
            onClick={() => setVaultOpen(false)}
            className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-medium transition-colors"
          >
            Selesai & Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
