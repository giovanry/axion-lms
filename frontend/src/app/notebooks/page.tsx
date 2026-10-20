"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Database,
  FileCode,
  HardDrive,
  Plus,
  Play,
  Search,
  Sparkles,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface NotebookItem {
  id: number;
  title: string;
  dataset_ref?: string | null;
  dataset_id?: number | null;
  created_at: string;
  last_modified: string;
}

export default function NotebooksCatalogPage() {
  const router = useRouter();
  const [notebooks, setNotebooks] = useState<NotebookItem[]>([]);
  const [localDatasets, setLocalDatasets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearch = useDebounce(searchQuery, 280);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/notebooks").then((res) => res.json()),
      fetch("/api/v1/datasets/local").then((res) => res.json()),
    ])
      .then(([nbData, dsData]) => {
        if (Array.isArray(nbData)) setNotebooks(nbData);
        if (Array.isArray(dsData)) setLocalDatasets(dsData);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreateNewNotebook = async (datasetRef?: string) => {
    try {
      const res = await fetch("/api/v1/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: datasetRef ? `${datasetRef.split("/").pop()} EDA & Modeling` : "Kaggle Analysis Notebook",
          dataset_ref: datasetRef || "uciml/iris",
        }),
      });
      if (res.ok) {
        const created = await res.json();
        router.push(`/notebooks/${created.id}?dataset=${encodeURIComponent(datasetRef || "uciml/iris")}`);
      }
    } catch (err) {
      alert("Gagal membuat notebook baru.");
    }
  };

  const filteredNotebooks = notebooks.filter((n) =>
    n.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (n.dataset_ref && n.dataset_ref.toLowerCase().includes(debouncedSearch.toLowerCase()))
  );

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-root max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-def">
        <div>
          <span className="text-meta text-primary font-mono block">KAGGLE CODE ENVIRONMENT</span>
          <h1 className="text-page-title text-slate-100 font-semibold">Notebooks & Analisis Data</h1>
        </div>

        <button
          onClick={() => handleCreateNewNotebook()}
          className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded text-label font-medium transition-colors shadow-sm self-start"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Notebook</span>
        </button>
      </div>

      {/* Quick Launch From Downloaded Datasets */}
      {localDatasets.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-section-header text-slate-200 flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-primary" />
            <span>Dataset Lokal Tersedia untuk EDA</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {localDatasets.map((ds) => (
              <div
                key={ds.id}
                className="p-3.5 bg-surface border border-border-def rounded-lg hover:border-primary/50 transition-colors flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-body font-semibold text-slate-100 font-mono truncate max-w-[200px]" title={ds.kaggle_ref}>
                      {ds.kaggle_ref}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {ds.size_mb} MB
                    </span>
                  </div>
                  <p className="text-meta text-slate-400 font-mono mt-1">
                    Path: {ds.local_path}
                  </p>
                </div>

                <button
                  onClick={() => handleCreateNewNotebook(ds.kaggle_ref)}
                  className="flex items-center justify-center space-x-1.5 w-full py-1.5 bg-elevated hover:bg-primary hover:text-white border border-border-def rounded text-label font-medium text-slate-200 transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Buka Kaggle Notebook</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Notebooks List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-section-header text-slate-200 flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-primary" />
            <span>Daftar Notebook Tersimpan</span>
          </h2>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari notebook..."
                className="px-3 py-1.5 bg-surface border border-border-def rounded text-label text-slate-200 focus:outline-none focus:border-primary w-56 font-mono"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 font-mono text-label">Memuat daftar notebook...</div>
        ) : filteredNotebooks.length === 0 ? (
          <div className="p-8 bg-surface border border-border-def rounded text-center space-y-3">
            <p className="text-slate-400 text-label">Belum ada notebook tersimpan.</p>
            <button
              onClick={() => handleCreateNewNotebook()}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded text-label font-medium transition-colors"
            >
              Buat Notebook Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredNotebooks.map((nb) => (
              <Link
                key={nb.id}
                href={`/notebooks/${nb.id}${nb.dataset_ref ? `?dataset=${encodeURIComponent(nb.dataset_ref)}` : ""}`}
                className="p-4 bg-surface border border-border-def rounded-lg hover:border-primary transition-colors flex items-start justify-between group"
              >
                <div className="space-y-1.5 flex-1 min-w-0 pr-3">
                  <div className="flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-semibold text-body text-slate-100 group-hover:text-primary transition-colors truncate">
                      {nb.title}
                    </span>
                  </div>

                  {nb.dataset_ref && (
                    <div className="flex items-center space-x-1 text-meta text-slate-400 font-mono">
                      <Database className="w-3 h-3 text-slate-500" />
                      <span className="truncate">{nb.dataset_ref}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-1 text-meta text-slate-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>Terakhir diubah: {new Date(nb.last_modified).toLocaleString()}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-elevated group-hover:bg-primary group-hover:text-white border border-border-def rounded text-meta font-medium text-slate-300 transition-colors shrink-0">
                  Buka
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
