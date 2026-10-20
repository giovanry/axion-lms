"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Download, FileCode, HardDrive, RefreshCw, Search, Trash2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface DatasetItem {
  id?: number;
  ref: string;
  title: string;
  size_mb: number;
  description: string;
}

export const DatasetBrowser: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("iris");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<DatasetItem[]>([]);
  const [localDatasets, setLocalDatasets] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeDownload, setActiveDownload] = useState<string | null>(null);

  const handleInitializeEda = async (kaggleRef: string, datasetId?: number) => {
    try {
      const res = await fetch("/api/v1/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${kaggleRef.split("/").pop()} EDA Baseline`,
          dataset_ref: kaggleRef,
          dataset_id: datasetId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/notebooks/${data.id}?dataset=${encodeURIComponent(kaggleRef)}`);
      } else {
        router.push(`/notebooks/new?dataset=${encodeURIComponent(kaggleRef)}`);
      }
    } catch (err) {
      router.push(`/notebooks/new?dataset=${encodeURIComponent(kaggleRef)}`);
    }
  };

  const fetchLocalDatasets = async () => {
    try {
      const res = await fetch("/api/v1/datasets/local");
      if (res.ok) {
        const data = await res.json();
        setLocalDatasets(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLocalDatasets();
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      handleSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/v1/datasets/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFetchDataset = async (kaggleRef: string) => {
    setActiveDownload(kaggleRef);
    try {
      const res = await fetch("/api/v1/datasets/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kaggle_ref: kaggleRef }),
      });
      if (res.ok) {
        setTimeout(fetchLocalDatasets, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setActiveDownload(null), 3000);
    }
  };

  const handleTriggerCleanup = async () => {
    try {
      const res = await fetch("/api/v1/datasets/cleanup");
      if (res.ok) {
        const data = await res.json();
        alert(`Pembersihan selesai: ${data.purged_datasets_count} dataset dibersihkan (${data.reclaimed_mb} MB dikembalikan).`);
        fetchLocalDatasets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-root max-w-6xl mx-auto">
      {/* Header and Cleanup Routine */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-def">
        <div>
          <span className="text-meta text-primary font-mono block">INTEGRASI DATA SCIENCE</span>
          <h1 className="text-page-title text-slate-100 font-semibold">Kaggle & Manajemen Dataset Lokal</h1>
        </div>

        <button
          onClick={handleTriggerCleanup}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-elevated hover:bg-surface border border-border-def rounded text-label text-slate-300 hover:text-rose-400 transition-colors self-start"
          title="Hapus dataset tidak terpakai > 14 hari"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Pembersihan Otomatis (&gt;14 Hari)</span>
        </button>
      </div>

      {/* Local Datasets Section */}
      <div className="space-y-3">
        <h2 className="text-section-header text-slate-200 flex items-center space-x-2">
          <HardDrive className="w-4 h-4 text-primary" />
          <span>Dataset Lokal Tersedia</span>
        </h2>

        {localDatasets.length === 0 ? (
          <div className="p-4 bg-surface border border-border-def rounded text-meta text-slate-500 text-center">
            Belum ada dataset yang diunduh secara lokal. Cari dan unduh dataset Kaggle di bawah ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {localDatasets.map((ds) => (
              <div key={ds.id} className="p-3 bg-surface border border-border-def rounded space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-body font-semibold text-slate-100 font-mono">{ds.kaggle_ref}</h3>
                    <p className="text-meta text-slate-400">Ukuran: {ds.size_mb} MB | Terakhir diakses: {new Date(ds.last_accessed).toLocaleDateString()}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded text-meta font-mono">
                    TERSIMPAN
                  </span>
                </div>
                <div className="pt-1 flex items-center justify-between text-meta">
                  <button
                    onClick={() => handleInitializeEda(ds.kaggle_ref, ds.id)}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-elevated hover:bg-primary hover:text-white border border-border-def rounded text-meta font-medium text-primary transition-colors"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Inisialisasi EDA</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kaggle Search Section */}
      <div className="space-y-4 pt-4 border-t border-border-def">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-section-header text-slate-200 flex items-center space-x-2">
            <Database className="w-4 h-4 text-primary" />
            <span>Pencarian Dataset Kaggle</span>
          </h2>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
              placeholder="Cari dataset (mis. iris, titanic)..."
              className="px-3 py-1.5 bg-surface border border-border-def rounded text-label text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary"
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              disabled={isSearching}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded text-label font-medium transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cari</span>
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-2">
          {isSearching ? (
            <div className="p-8 text-center text-slate-400 font-mono text-label flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              <span>Menghubungi endpoint Kaggle...</span>
            </div>
          ) : (
            searchResults.map((res, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-surface border border-border-def rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-600 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-body text-slate-100">{res.title}</span>
                    <span className="text-meta font-mono text-primary px-1.5 py-0.5 bg-primary-muted rounded">
                      {res.ref}
                    </span>
                  </div>
                  <p className="text-meta text-slate-400 line-clamp-1">{res.description || "Tidak ada deskripsi rinci."}</p>
                  <span className="text-meta text-slate-500 font-mono">Ukuran: {res.size_mb} MB</span>
                </div>

                <button
                  onClick={() => handleFetchDataset(res.ref)}
                  disabled={activeDownload === res.ref}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-elevated hover:bg-surface border border-border-def hover:border-primary rounded text-label font-medium text-slate-200 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span>{activeDownload === res.ref ? "Mengunduh..." : "Unduh ke Lokal"}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
