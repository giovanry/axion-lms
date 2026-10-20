"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING_SNAPPY, SPRING_SMOOTH, SPRING_BOUNCY } from "@/lib/motion-config";
import { AnimatedTabContent, CollapsibleSection } from "@/components/ui/motion-primitives";
import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  HardDrive,
  HelpCircle,
  Key,
  RefreshCw,
  Save,
  Settings,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  UserCheck,
  X,
} from "lucide-react";
import { useLmsStore } from "@/stores/useLmsStore";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstBoot?: boolean;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  isFirstBoot = false,
}) => {
  const { userStats, setUserStats } = useLmsStore();
  const [activeTab, setActiveTab] = useState<"CODEFORCES" | "KAGGLE" | "AI_GEMINI" | "BACKUP" | "SYSTEM">("KAGGLE");
  const modalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Codeforces state
  const [cfHandle, setCfHandle] = useState<string>("");
  const [cfProfile, setCfProfile] = useState<any | null>(null);
  const [isVerifyingCf, setIsVerifyingCf] = useState<boolean>(false);
  const [cfError, setCfError] = useState<string | null>(null);

  // Kaggle state
  const [kaggleUsername, setKaggleUsername] = useState<string>("");
  const [kaggleKey, setKaggleKey] = useState<string>("");
  const [isKaggleLinked, setIsKaggleLinked] = useState<boolean>(false);
  const [isSavingKaggle, setIsSavingKaggle] = useState<boolean>(false);
  const [kaggleSuccess, setKaggleSuccess] = useState<string | null>(null);
  const [kaggleDropError, setKaggleDropError] = useState<string | null>(null);
  const [isDraggingKaggle, setIsDraggingKaggle] = useState<boolean>(false);
  const kaggleFileInputRef = useRef<HTMLInputElement>(null);

  // Gemini & AI state
  const [geminiApiKey, setGeminiApiKey] = useState<string>("");
  const [showGeminiKey, setShowGeminiKey] = useState<boolean>(false);
  const [isSavingGeminiKey, setIsSavingGeminiKey] = useState<boolean>(false);
  const [geminiSaveSuccess, setGeminiSaveSuccess] = useState<string | null>(null);
  const [isTestingGemini, setIsTestingGemini] = useState<boolean>(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{
    success: boolean;
    model?: string;
    latency_ms?: number;
    message?: string;
    error?: string;
  } | null>(null);

  // Backup & Cleanup state
  const [isExportingBackup, setIsExportingBackup] = useState<boolean>(false);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);
  const [isCleaningUp, setIsCleaningUp] = useState<boolean>(false);
  const [isResettingUser, setIsResettingUser] = useState<boolean>(false);
  const [resetResult, setResetResult] = useState<string | null>(null);

  // System status
  const [aiEngineStatus, setAiEngineStatus] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/v1/user/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.codeforces_handle) {
          setCfHandle(data.codeforces_handle);
          verifyCodeforcesHandle(data.codeforces_handle);
        }
        if (data.kaggle_username) {
          setKaggleUsername(data.kaggle_username);
        }
        setIsKaggleLinked(data.has_kaggle || false);
      })
      .catch((err) => console.error(err));

    fetch("/api/v1/ai/status")
      .then((res) => res.json())
      .then((data) => setAiEngineStatus(data.active))
      .catch(() => setAiEngineStatus(false));
  }, [isOpen]);

  const verifyCodeforcesHandle = async (handle: string) => {
    if (!handle.trim()) return;
    setIsVerifyingCf(true);
    setCfError(null);
    try {
      const res = await fetch(`/api/v1/codeforces/user/${encodeURIComponent(handle.trim())}`);
      if (!res.ok) {
        throw new Error("Handle tidak ditemukan di Codeforces.");
      }
      const data = await res.json();
      setCfProfile(data);

      await fetch("/api/v1/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeforces_handle: handle.trim() }),
      });
    } catch (err: any) {
      setCfProfile(null);
      setCfError(err.message || "Gagal memverifikasi handle Codeforces.");
    } finally {
      setIsVerifyingCf(false);
    }
  };

  const handleKaggleFileProcess = async (file: File) => {
    setKaggleDropError(null);
    setKaggleSuccess(null);
    if (!file.name.endsWith(".json")) {
      setKaggleDropError("Harap unggah berkas 'kaggle.json' yang valid.");
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.username || !parsed.key) {
        setKaggleDropError("Format kaggle.json tidak valid (wajib memiliki field 'username' dan 'key').");
        return;
      }

      setIsSavingKaggle(true);
      const res = await fetch("/api/v1/vault/kaggle-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: parsed.username,
          key: parsed.key,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan ke ~/.kaggle/kaggle.json");
      const data = await res.json();

      setIsKaggleLinked(true);
      setKaggleUsername(parsed.username);
      setKaggleSuccess(`File ${file.name} berhasil diunggah! Terkoneksi sebagai @${parsed.username}.`);
    } catch (err: any) {
      setKaggleDropError(err.message || "Gagal memproses berkas JSON.");
    } finally {
      setIsSavingKaggle(false);
    }
  };

  const handleSaveKaggleCredentials = async () => {
    if (!kaggleUsername.trim() || !kaggleKey.trim()) {
      alert("Harap isi Username dan API Key Kaggle.");
      return;
    }
    setIsSavingKaggle(true);
    setKaggleSuccess(null);
    setKaggleDropError(null);
    try {
      const res = await fetch("/api/v1/vault/kaggle-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: kaggleUsername.trim(),
          key: kaggleKey.trim(),
        }),
      });
      if (res.ok) {
        setIsKaggleLinked(true);
        setKaggleSuccess("Kredensial Kaggle berhasil disimpan di ~/.kaggle/kaggle.json!");
        setKaggleKey("");
      } else {
        throw new Error("Gagal menyimpan kredensial.");
      }
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan kredensial.");
    } finally {
      setIsSavingKaggle(false);
    }
  };

  const handleSaveGeminiKey = async () => {
    if (!geminiApiKey.trim()) return;
    setIsSavingGeminiKey(true);
    setGeminiSaveSuccess(null);
    try {
      const res = await fetch("/api/v1/vault/gemini-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: geminiApiKey.trim() }),
      });
      if (res.ok) {
        setGeminiSaveSuccess("Kunci Gemini API berhasil diperbarui di sistem.");
      } else {
        throw new Error("Gagal menyimpan kunci Gemini.");
      }
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan kunci.");
    } finally {
      setIsSavingGeminiKey(false);
    }
  };

  const handleTestGeminiConnection = async () => {
    setIsTestingGemini(true);
    setGeminiTestResult(null);
    try {
      const res = await fetch("/api/v1/vault/test-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: geminiApiKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      setGeminiTestResult(data);
    } catch (err: any) {
      setGeminiTestResult({
        success: false,
        error: err.message || "Gagal menghubungi endpoint Gemini.",
      });
    } finally {
      setIsTestingGemini(false);
    }
  };

  const handleExportBackup = async () => {
    setIsExportingBackup(true);
    try {
      const res = await fetch("/api/v1/export/backup");
      if (!res.ok) throw new Error("Gagal mengunduh backup arsip.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `olympus_backup_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: any) {
      alert(err.message || "Gagal melakukan export backup.");
    } finally {
      setIsExportingBackup(false);
    }
  };

  const handleTriggerCleanup = async () => {
    setIsCleaningUp(true);
    setCleanupResult(null);
    try {
      const res = await fetch("/api/v1/datasets/cleanup");
      if (res.ok) {
        const data = await res.json();
        setCleanupResult(
          `Pembersihan selesai: ${data.purged_datasets_count} dataset dibersihkan (${data.reclaimed_mb} MB dikembalikan).`
        );
      }
    } catch (err) {
      setCleanupResult("Gagal menjalankan pembersihan dataset.");
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleResetUserData = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus SEMUA data pengguna, progres belajar, dan riwayat notebook? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }
    setIsResettingUser(true);
    setResetResult(null);
    try {
      const res = await fetch("/api/v1/user/reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setResetResult(data.message || "Semua data pengguna berhasil direset.");
        setCfHandle("");
        setCfProfile(null);
        setKaggleUsername("");
        setIsKaggleLinked(false);
        setUserStats({ id: 1, name: "Axion Scholar", daily_streak: 0, last_active_date: null });
      } else {
        throw new Error("Gagal mereset data.");
      }
    } catch (err: any) {
      setResetResult("Terjadi kesalahan saat mereset data pengguna.");
    } finally {
      setIsResettingUser(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={SPRING_SNAPPY}
            className="relative w-full max-w-2xl bg-surface border border-border-def rounded-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh] z-10"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="h-12 px-4 bg-elevated border-b border-border-def flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-primary" />
                <h2 className="text-section-header text-slate-100 font-semibold">
                  Pengaturan & Konfigurasi Axion
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                transition={SPRING_SNAPPY}
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-surface"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* First Boot Alert Banner (Collapsible with smooth height glide) */}
            <CollapsibleSection isOpen={!isKaggleLinked || isFirstBoot}>
              <div className="px-4 py-2.5 bg-primary/10 border-b border-primary/30 flex items-center space-x-2.5 text-meta text-primary">
                <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
                <div className="flex-1">
                  <span className="font-semibold text-slate-100">Selamat datang di Axion! </span>
                  <span>Hubungkan kredensial Kaggle & Gemini API untuk mengaktifkan seluruh fitur komputasi, unduh dataset otomatis, dan Socratic AI Tutor.</span>
                </div>
              </div>
            </CollapsibleSection>

            {/* Tab Navigation with Shared Sliding Pill */}
            <div className="flex border-b border-border-def bg-root px-4 pt-2 overflow-x-auto relative">
              <button
                onClick={() => setActiveTab("KAGGLE")}
                className={`relative px-3.5 py-2 text-label font-medium transition-colors flex items-center space-x-1.5 shrink-0 z-10 ${
                  activeTab === "KAGGLE"
                    ? "text-primary"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {activeTab === "KAGGLE" && (
                  <motion.div
                    layoutId="settings-active-tab-pill"
                    className="absolute inset-0 bg-primary/10 rounded-t border-b-2 border-primary -z-10"
                    transition={SPRING_SNAPPY}
                  />
                )}
                <Key className="w-3.5 h-3.5" />
                <span>Kaggle</span>
                {isKaggleLinked && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Terhubung" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("AI_GEMINI")}
                className={`relative px-3.5 py-2 text-label font-medium transition-colors flex items-center space-x-1.5 shrink-0 z-10 ${
                  activeTab === "AI_GEMINI"
                    ? "text-primary"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {activeTab === "AI_GEMINI" && (
                  <motion.div
                    layoutId="settings-active-tab-pill"
                    className="absolute inset-0 bg-primary/10 rounded-t border-b-2 border-primary -z-10"
                    transition={SPRING_SNAPPY}
                  />
                )}
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>AI & Gemini</span>
              </button>

              <button
                onClick={() => setActiveTab("CODEFORCES")}
                className={`relative px-3.5 py-2 text-label font-medium transition-colors flex items-center space-x-1.5 shrink-0 z-10 ${
                  activeTab === "CODEFORCES"
                    ? "text-primary"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {activeTab === "CODEFORCES" && (
                  <motion.div
                    layoutId="settings-active-tab-pill"
                    className="absolute inset-0 bg-primary/10 rounded-t border-b-2 border-primary -z-10"
                    transition={SPRING_SNAPPY}
                  />
                )}
                <Trophy className="w-3.5 h-3.5" />
                <span>Codeforces</span>
              </button>

              <button
                onClick={() => setActiveTab("BACKUP")}
                className={`relative px-3.5 py-2 text-label font-medium transition-colors flex items-center space-x-1.5 shrink-0 z-10 ${
                  activeTab === "BACKUP"
                    ? "text-primary"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {activeTab === "BACKUP" && (
                  <motion.div
                    layoutId="settings-active-tab-pill"
                    className="absolute inset-0 bg-primary/10 rounded-t border-b-2 border-primary -z-10"
                    transition={SPRING_SNAPPY}
                  />
                )}
                <Download className="w-3.5 h-3.5" />
                <span>Cadangan & Ekspor</span>
              </button>

              <button
                onClick={() => setActiveTab("SYSTEM")}
                className={`relative px-3.5 py-2 text-label font-medium transition-colors flex items-center space-x-1.5 shrink-0 z-10 ${
                  activeTab === "SYSTEM"
                    ? "text-primary"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {activeTab === "SYSTEM" && (
                  <motion.div
                    layoutId="settings-active-tab-pill"
                    className="absolute inset-0 bg-primary/10 rounded-t border-b-2 border-primary -z-10"
                    transition={SPRING_SNAPPY}
                  />
                )}
                <Cpu className="w-3.5 h-3.5" />
                <span>Sistem & Lingkungan</span>
              </button>
            </div>

            {/* Modal Body with AnimatedTabContent & Seamless Auto-Resize */}
            <div
              ref={modalBodyRef}
              className="p-6 overflow-y-auto space-y-6 text-body text-slate-300 flex-1 min-h-0"
            >
              <AnimatedTabContent tabKey={activeTab}>
          {/* TAB 1: KAGGLE (DEFAULT & HIGHLIGHTED) */}
          {activeTab === "KAGGLE" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-root border border-border-def rounded">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-primary" />
                  <span className="text-label text-slate-200 font-medium">Status API Kaggle Lokal:</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-meta font-mono font-medium ${
                    isKaggleLinked
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-amber-950 text-amber-400 border border-amber-800"
                  }`}
                >
                  {isKaggleLinked ? "TERHUBUNG (~/.kaggle/kaggle.json)" : "BELUM TERHUBUNG"}
                </span>
              </div>

              {/* Drag-and-drop Dropzone for kaggle.json */}
              <div className="space-y-2">
                <label className="text-label text-slate-200 font-medium block">
                  Unggah Berkas <code className="text-primary font-mono font-normal">kaggle.json</code> (Disarankan)
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingKaggle(true);
                  }}
                  onDragLeave={() => setIsDraggingKaggle(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingKaggle(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleKaggleFileProcess(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => kaggleFileInputRef.current?.click()}
                  className={`p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                    isDraggingKaggle
                      ? "border-primary bg-primary/10"
                      : "border-border-def bg-root hover:border-primary/50 hover:bg-elevated/40"
                  }`}
                >
                  <input
                    ref={kaggleFileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleKaggleFileProcess(e.target.files[0]);
                      }
                    }}
                  />
                  <Upload className="w-8 h-8 text-primary mb-2 opacity-80" />
                  <span className="text-label font-medium text-slate-200">
                    Tarik dan lepaskan file <code className="text-primary font-mono">kaggle.json</code> ke sini
                  </span>
                  <span className="text-meta text-slate-400 mt-1">
                    atau klik untuk memilih file dari komputer Anda
                  </span>
                </div>
              </div>

              {kaggleSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={SPRING_SNAPPY}
                  className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded text-emerald-300 text-meta flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{kaggleSuccess}</span>
                </motion.div>
              )}

              {kaggleDropError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={SPRING_SNAPPY}
                  className="p-3 bg-rose-950/40 border border-rose-800/60 rounded text-rose-300 text-meta flex items-center space-x-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{kaggleDropError}</span>
                </motion.div>
              )}

              {/* Form Input Manual (Alternative) */}
              <div className="pt-2 border-t border-border-def space-y-3">
                <span className="text-meta font-medium text-slate-400 block uppercase tracking-wider">
                  Atau Isi Kredensial Secara Manual
                </span>
                <div className="space-y-1">
                  <label className="text-label text-slate-300 font-medium block">
                    Kaggle Username
                  </label>
                  <input
                    type="text"
                    value={kaggleUsername}
                    onChange={(e) => setKaggleUsername(e.target.value)}
                    placeholder="Contoh: giivanto"
                    className="w-full px-3 py-2 bg-root border border-border-def rounded text-slate-200 focus:outline-none focus:border-primary font-mono text-label"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-label text-slate-300 font-medium block">
                    Kaggle API Key (Token)
                  </label>
                  <input
                    type="password"
                    value={kaggleKey}
                    onChange={(e) => setKaggleKey(e.target.value)}
                    placeholder="Contoh: 7a8b9c0d1e2f3a4b..."
                    className="w-full px-3 py-2 bg-root border border-border-def rounded text-slate-200 focus:outline-none focus:border-primary font-mono text-label"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveKaggleCredentials}
                    disabled={isSavingKaggle || !kaggleUsername.trim() || !kaggleKey.trim()}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded text-label font-medium transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingKaggle ? "Menyimpan..." : "Simpan Token Kaggle"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI & GEMINI */}
          {activeTab === "AI_GEMINI" && (
            <div className="space-y-5">
              <div className="p-4 bg-root border border-border-def rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-label font-semibold text-slate-100">
                      Model AI Aktif (Primary):
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded text-meta font-mono font-medium">
                    gemini-3.6-flash
                  </span>
                </div>
                <p className="text-meta text-slate-400 leading-relaxed">
                  Axion menggunakan <strong className="text-slate-200 font-medium">Google Gemini 3.6 Flash</strong> sebagai motor penalaran Socratic Tutor, ekstraksi kurikulum multimodal, dan pembuatan soal OSN. Jika kuota API habis, sistem secara otomatis beralih ke Ollama Llama 3 lokal.
                </p>
              </div>

              {/* Gemini API Key Form */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-label text-slate-200 font-medium block">
                    Google Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showGeminiKey ? "text" : "password"}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="Masukkan kunci AI Studio (AIzaSy...)"
                      className="w-full px-3 py-2 pr-10 bg-root border border-border-def rounded text-slate-200 focus:outline-none focus:border-primary font-mono text-label"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleTestGeminiConnection}
                    disabled={isTestingGemini}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-elevated hover:bg-surface border border-border-def text-slate-300 hover:text-white rounded text-label font-medium transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingGemini ? "animate-spin text-primary" : ""}`} />
                    <span>{isTestingGemini ? "Menguji Latensi..." : "Uji Koneksi Gemini"}</span>
                  </button>

                  <button
                    onClick={handleSaveGeminiKey}
                    disabled={isSavingGeminiKey || !geminiApiKey.trim()}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded text-label font-medium transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingGeminiKey ? "Menyimpan..." : "Simpan Kunci"}</span>
                  </button>
                </div>

                {geminiSaveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={SPRING_SNAPPY}
                    className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded text-emerald-300 text-meta flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{geminiSaveSuccess}</span>
                  </motion.div>
                )}

                {geminiTestResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={SPRING_SNAPPY}
                    className={`p-3 border rounded text-meta font-mono flex items-center space-x-2 ${
                      geminiTestResult.success
                        ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                        : "bg-rose-950/40 border-rose-800/60 text-rose-300"
                    }`}
                  >
                    {geminiTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{geminiTestResult.message || geminiTestResult.error}</span>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CODEFORCES */}
          {activeTab === "CODEFORCES" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-label text-slate-200 font-medium block">
                  Username / Handle Codeforces
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={cfHandle}
                    onChange={(e) => setCfHandle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && verifyCodeforcesHandle(cfHandle)}
                    placeholder="Contoh: tourist atau username_anda"
                    className="flex-1 px-3 py-2 bg-root border border-border-def rounded text-slate-200 focus:outline-none focus:border-primary font-mono text-label"
                  />
                  <button
                    onClick={() => verifyCodeforcesHandle(cfHandle)}
                    disabled={isVerifyingCf || !cfHandle.trim()}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded text-label font-medium transition-colors"
                  >
                    {isVerifyingCf ? "Memeriksa..." : "Verifikasi & Hubungkan"}
                  </button>
                </div>
              </div>

              {cfError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={SPRING_SNAPPY}
                  className="p-3 bg-rose-950/40 border border-rose-800/60 rounded text-rose-300 text-meta flex items-center space-x-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cfError}</span>
                </motion.div>
              )}

              {cfProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={SPRING_SNAPPY}
                  className="p-4 bg-elevated border border-primary/40 rounded flex items-center space-x-4"
                >
                  {cfProfile.avatar && (
                    <img
                      src={cfProfile.avatar}
                      alt={cfProfile.handle}
                      className="w-16 h-16 rounded border border-border-def object-cover"
                    />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-section-header font-bold text-slate-100 font-mono">
                        {cfProfile.handle}
                      </span>
                      <span className="px-2 py-0.5 bg-primary-muted text-primary rounded text-meta font-mono">
                        {cfProfile.rank}
                      </span>
                    </div>
                    <div className="text-meta text-slate-400 font-mono space-x-3">
                      <span>Rating: <strong className="text-emerald-400">{cfProfile.rating}</strong></span>
                      <span>Max: <strong className="text-slate-200">{cfProfile.max_rating}</strong> ({cfProfile.max_rank})</span>
                    </div>
                    <p className="text-meta text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Akun berhasil ditautkan ke Axion LMS!</span>
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="p-4 bg-root border border-border-def rounded space-y-2 text-meta text-slate-400">
                <span className="font-semibold text-slate-200 block text-label">
                  Panduan Akun Codeforces:
                </span>
                <p>
                  Masukkan handle profil publik Anda di atas. Axion tidak memerlukan kata sandi; verifikasi dilakukan secara aman melalui API publik Codeforces.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP & DATA */}
          {activeTab === "BACKUP" && (
            <div className="space-y-5">
              <div className="p-4 bg-root border border-border-def rounded space-y-3">
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-primary" />
                  <h3 className="text-label font-semibold text-slate-100">
                    Ekspor Cadangan Lengkap (1-Click ZIP Backup)
                  </h3>
                </div>
                <p className="text-meta text-slate-400 leading-relaxed">
                  Unduh seluruh data pembelajaran lokal Anda ke dalam arsip ZIP, termasuk database SQLite (<code className="text-primary font-mono">olympus.db</code>), riwayat notebook (<code className="text-primary font-mono">data/notebooks/</code>), dan catatan video timestamped.
                </p>
                <button
                  onClick={handleExportBackup}
                  disabled={isExportingBackup}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded text-label font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExportingBackup ? "Menyiapkan Arsip..." : "Unduh Backup ZIP Sekarang"}</span>
                </button>
              </div>

              <div className="p-4 bg-root border border-border-def rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <h3 className="text-label font-semibold text-slate-100">
                      Pembersihan Dataset Kadaluarsa (&gt;14 Hari)
                    </h3>
                  </div>
                  <button
                    onClick={handleTriggerCleanup}
                    disabled={isCleaningUp}
                    className="px-3 py-1.5 bg-elevated hover:bg-surface border border-border-def rounded text-meta font-medium text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    {isCleaningUp ? "Membersihkan..." : "Jalankan Pembersihan"}
                  </button>
                </div>
                <p className="text-meta text-slate-400">
                  Secara otomatis membebaskan ruang disk dengan menghapus dataset lokal yang tidak diakses selama lebih dari 14 hari.
                </p>
                {cleanupResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={SPRING_SNAPPY}
                    className="p-2.5 bg-elevated border border-border-def rounded text-meta font-mono text-emerald-400"
                  >
                    {cleanupResult}
                  </motion.div>
                )}
              </div>

              {/* Danger Zone: Reset Data Pengguna */}
              <div className="p-4 bg-rose-950/20 border border-rose-800/40 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <h3 className="text-label font-semibold text-rose-200">
                      Reset Total Data Pengguna & Progres
                    </h3>
                  </div>
                  <button
                    onClick={handleResetUserData}
                    disabled={isResettingUser}
                    className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-100 border border-rose-700/60 rounded text-meta font-medium transition-colors"
                  >
                    {isResettingUser ? "Mereset..." : "Hapus Semua Data"}
                  </button>
                </div>
                <p className="text-meta text-rose-300/80">
                  Mengembalikan profil ke status awal (0 streak, 0 jam belajar), menghapus status penyelesaian semua modul materi, mengosongkan riwayat notebook, dan menghapus catatan pribadi.
                </p>
                {resetResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={SPRING_SNAPPY}
                    className="p-2.5 bg-surface border border-rose-800/50 rounded text-meta font-mono text-rose-200"
                  >
                    {resetResult}
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM & ENVIRONMENT */}
          {activeTab === "SYSTEM" && (
            <div className="space-y-4 font-mono text-meta">
              <div className="p-3.5 bg-root border border-border-def rounded flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-semibold block text-label">Engine AI Primary:</span>
                  <span className="text-slate-400">Google Gemini 3.6 Flash</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-medium">
                  READY
                </span>
              </div>

              <div className="p-3.5 bg-root border border-border-def rounded flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-semibold block text-label">Engine AI Local Fallback:</span>
                  <span className="text-slate-400">Ollama Local Service (llama3.2)</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded font-medium ${
                    aiEngineStatus
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-amber-950 text-amber-400 border border-amber-800"
                  }`}
                >
                  {aiEngineStatus ? "ONLINE (localhost:11434)" : "STANDBY"}
                </span>
              </div>

              <div className="p-3.5 bg-root border border-border-def rounded flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-semibold block text-label">Penyimpanan Database:</span>
                  <span className="text-slate-400">SQLite Local Engine (olympus.db)</span>
                </div>
                <span className="px-2 py-0.5 bg-primary-muted text-primary border border-primary/30 rounded font-medium">
                  LOCAL-FIRST
                </span>
              </div>
            </div>
          )}
              </AnimatedTabContent>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
