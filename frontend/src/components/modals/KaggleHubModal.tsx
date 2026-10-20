"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Database,
  Search,
  Download,
  CheckCircle2,
  FileSpreadsheet,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { useAxionStore } from "@/stores/useAxionStore";

export const KaggleHubModal: React.FC = () => {
  const { isKaggleHubOpen, setKaggleHubOpen, addChatMessage } = useAxionStore();
  const [query, setQuery] = useState("");
  const [datasets, setDatasets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingRef, setDownloadingRef] = useState<string | null>(null);
  const [downloadedRefs, setDownloadedRefs] = useState<string[]>(["uciml/iris"]);

  // 1. Initial and debounced search
  useEffect(() => {
    if (!isKaggleHubOpen) return;

    const timer = setTimeout(() => {
      setIsLoading(true);
      fetch(`/api/v1/kaggle/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setDatasets(data);
          }
        })
        .catch((err) => console.warn("Failed to search datasets:", err))
        .finally(() => setIsLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isKaggleHubOpen]);

  if (!isKaggleHubOpen) return null;

  const handleDownload = async (ref: string, title: string) => {
    setDownloadingRef(ref);

    try {
      const res = await fetch("/api/v1/kaggle/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kaggle_ref: ref }),
      });

      const data = await res.json();
      if (data.success) {
        setDownloadedRefs((prev) => [...prev, ref]);
        addChatMessage({
          sender: "system",
          text: `Dataset '${title}' (${ref}) berhasil diunduh ke folder lokal: ${data.local_path} (${data.size_mb} MB). Siap digunakan di Zona 3!`,
        });
      } else {
        alert(`Gagal mengunduh: ${data.error || "Terjadi kesalahan"}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setDownloadingRef(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span className="text-[14px] font-semibold text-zinc-100">
              Kaggle Dataset Hub — Penarik Dataset Kompetisi Satu-Klik
            </span>
          </div>

          <button
            onClick={() => setKaggleHubOpen(false)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/30">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari dataset kompetisi Kaggle (misal: Titanic, Iris, Housing, Churn)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded pl-9 pr-3 py-1.5 text-[12px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>
        </div>

        {/* List */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="p-8 text-center font-mono text-[11px] text-zinc-500">
              Mencari dataset dari Kaggle API...
            </div>
          ) : datasets.length === 0 ? (
            <div className="p-8 text-center text-[12px] text-zinc-500">
              Tidak ada dataset ditemukan untuk kata kunci "{query}".
            </div>
          ) : (
            datasets.map((ds) => {
              const isDownloaded = downloadedRefs.includes(ds.ref);
              const isDownloading = downloadingRef === ds.ref;

              return (
                <div
                  key={ds.ref}
                  className="p-3.5 rounded border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded">
                        Kaggle Dataset
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">{ds.size_mb} MB</span>
                    </div>
                    <h4 className="text-[13px] font-semibold text-zinc-100">{ds.title}</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-1">
                      {ds.description}
                    </p>
                    <div className="text-[10px] font-mono text-zinc-500 truncate">
                      Ref: {ds.ref}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isDownloaded ? (
                      <div className="flex items-center space-x-1 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready in Data Tab</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownload(ds.ref, ds.title)}
                        disabled={isDownloading}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-medium transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isDownloading ? "Mengunduh..." : "Fetch to Workspace"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>Kredensial Aktif: ~/.kaggle/kaggle.json</span>
          <button
            onClick={() => setKaggleHubOpen(false)}
            className="px-3 py-1 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
