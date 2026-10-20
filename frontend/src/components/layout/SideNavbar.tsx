"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Database,
  FileCode,
  Flame,
  Home,
  Layers,
  Plus,
  Settings,
  Trophy,
  X,
  Compass,
} from "lucide-react";
import { useLmsStore } from "@/stores/useLmsStore";
import { AccountSettingsModal } from "@/components/settings/AccountSettingsModal";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { fetchWithCache } from "@/lib/apiCache";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING_SNAPPY, SPRING_SMOOTH } from "@/lib/motion-config";

interface RecentNotebook {
  id: number;
  title: string;
  dataset_ref?: string | null;
  last_modified?: string;
}

export const SideNavbar: React.FC = () => {
  const pathname = usePathname();
  const { userStats } = useLmsStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [recentNotebooks, setRecentNotebooks] = useState<RecentNotebook[]>([]);
  const [isNotebookDropdownOpen, setIsNotebookDropdownOpen] = useState(true);

  const isOpen = isPinned || isHovered;

  const fetchRecentNotebooks = async () => {
    try {
      const data = await fetchWithCache<any[]>("/api/v1/notebooks", undefined, 30_000);
      if (Array.isArray(data)) {
        setRecentNotebooks(data.slice(0, 3));
      }
    } catch {
      // Fallback silently
    }
  };

  useEffect(() => {
    fetchRecentNotebooks();
    const handleNotebookOpened = () => {
      fetchRecentNotebooks();
    };
    window.addEventListener("olympus:notebook_opened", handleNotebookOpened);

    // First boot credential check
    const firstBootPrompted = localStorage.getItem("axion_first_boot_prompted");
    if (!firstBootPrompted) {
      fetch("/api/v1/user/stats")
        .then((r) => r.json())
        .then((data) => {
          if (!data.has_kaggle) {
            setIsSettingsOpen(true);
          }
        })
        .catch(() => {})
        .finally(() => {
          localStorage.setItem("axion_first_boot_prompted", "true");
        });
    }

    return () => {
      window.removeEventListener("olympus:notebook_opened", handleNotebookOpened);
    };
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home, exact: true },
    { href: "/roadmap", label: "Roadmap", icon: Layers },
    { href: "/learn", label: "Belajar", icon: BookOpen },
    { href: "/playground", label: "Playground CP", icon: Code2 },
    { href: "/datasets", label: "Datasets", icon: Database },
    { href: "/notebooks", label: "Notebooks", icon: FileCode, hasDropdown: true },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <>
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          // Klik spot kosong sidebar akan membuat sidebar terkunci lebar sampai klik tanda X
          const target = e.target as HTMLElement;
          if (target.closest("button") || target.closest("a")) return;
          setIsPinned(true);
        }}
        className={`h-screen sticky top-0 z-50 bg-surface border-r border-border-def flex flex-col justify-between transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] select-none shadow-xl shrink-0 cursor-pointer will-change-[width] ${
          isOpen ? "w-56" : "w-14"
        }`}
      >
        {/* Top: Logo, Brand & Close 'X' Button */}
        <div className="flex flex-col">
          <div className="h-14 flex items-center px-3 border-b border-border-def overflow-hidden justify-between">
            <Link
              href="/"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center text-slate-100 hover:text-primary transition-colors overflow-hidden flex-1 min-w-0"
              title="Axion LMS"
            >
              <div className="w-8 h-8 rounded bg-primary/10 border border-primary/40 flex items-center justify-center shrink-0">
                <span className="font-bold text-primary font-mono text-sm">A</span>
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ease-out whitespace-nowrap flex items-center space-x-1.5 ${
                  isOpen
                    ? "opacity-100 max-w-[130px] ml-2.5 translate-x-0"
                    : "opacity-0 max-w-0 ml-0 -translate-x-2 pointer-events-none"
                }`}
              >
                <span className="font-bold tracking-tight text-slate-100 text-sm">AXION</span>
                <span className="text-[10px] text-primary font-mono px-1 py-0.2 border border-primary/30 rounded-sm">
                  LMS
                </span>
              </div>
            </Link>

            {/* Tombol X untuk menciutkan / melepas pin sidebar */}
            {isOpen && isPinned && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPinned(false);
                  setIsHovered(false);
                }}
                title="Tutup / Ciutkan Sidebar (X)"
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-elevated transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);

              return (
                <div key={link.href} className="relative group">
                  <motion.div
                    whileHover={{ scale: 1.01, x: isOpen ? 2 : 0 }}
                    whileTap={{ scale: 0.97 }}
                    transition={SPRING_SNAPPY}
                    className={`relative flex items-center h-10 rounded transition-colors ${
                      isOpen ? "px-2.5" : "px-0 justify-center"
                    } ${
                      isActive
                        ? "text-primary font-medium"
                        : "text-slate-400 hover:text-slate-100 hover:bg-elevated border border-transparent"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute inset-0 bg-primary-muted rounded border border-primary/30 -z-0"
                        transition={SPRING_SNAPPY}
                      />
                    )}
                    <Link
                      href={link.href}
                      onClick={(e) => e.stopPropagation()}
                      title={!isOpen ? link.label : undefined}
                      className={`relative z-10 flex items-center ${
                        isOpen ? "flex-1 min-w-0" : "w-10 justify-center"
                      } h-full`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                      </div>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-out whitespace-nowrap flex-1 ${
                          isOpen
                            ? "opacity-100 max-w-[130px] ml-3 translate-x-0"
                            : "opacity-0 max-w-0 ml-0 -translate-x-2 pointer-events-none hidden"
                        }`}
                      >
                        <span className="text-label truncate block">{link.label}</span>
                      </div>
                    </Link>

                    {isOpen && link.hasDropdown && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsNotebookDropdownOpen((prev) => !prev);
                        }}
                        title="Tampilkan/Sembunyikan 3 Notebook Terakhir"
                        className="relative z-10 p-1 text-slate-400 hover:text-white rounded hover:bg-elevated/80 transition-all shrink-0 ml-1"
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isNotebookDropdownOpen ? "rotate-0" : "-rotate-90"
                          }`}
                        />
                      </button>
                    )}
                  </motion.div>

                  {/* Submenu for Expanded Sidebar with Collapsible Animation */}
                  <AnimatePresence>
                    {isOpen && link.hasDropdown && isNotebookDropdownOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={SPRING_SMOOTH}
                        className="overflow-hidden pl-4 pr-1 py-1 space-y-0.5"
                      >
                        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 px-2 py-0.5 flex items-center space-x-1">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          <span>3 Terakhir Dibuka</span>
                        </div>
                        {recentNotebooks.length > 0 ? (
                          recentNotebooks.map((nb) => {
                            const isCurrent = pathname === `/notebooks/${nb.id}`;
                            return (
                              <motion.div
                                key={nb.id}
                                whileHover={{ x: 3 }}
                                transition={SPRING_SNAPPY}
                              >
                                <Link
                                  href={`/notebooks/${nb.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`flex items-center space-x-2 py-1 px-2 rounded text-xs transition-colors group/item ${
                                    isCurrent
                                      ? "bg-primary/20 text-primary font-medium border border-primary/30"
                                      : "text-slate-400 hover:text-slate-100 hover:bg-elevated"
                                  }`}
                                  title={nb.title}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0 group-hover/item:bg-primary" />
                                  <span className="truncate whitespace-nowrap text-[11px] flex-1">
                                    {nb.title || `Notebook #${nb.id}`}
                                  </span>
                                </Link>
                              </motion.div>
                            );
                          })
                        ) : (
                          <div className="text-[11px] text-slate-500 px-2 py-1 italic">
                            Belum ada notebook
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility Controls: Streak & Unified Settings */}
        <div className="p-2 border-t border-border-def space-y-1 bg-surface overflow-hidden">
          {/* Daily Streak Indicator */}
          <div
            title={`Daily Streak: ${userStats?.daily_streak ?? 1} hari berturut-turut`}
            className="flex items-center h-9 rounded px-2.5 text-label text-amber-400 bg-elevated/50 border border-border-def/50 overflow-hidden"
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-amber-500 shrink-0" />
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ease-out whitespace-nowrap flex items-center space-x-1 ${
                isOpen
                  ? "opacity-100 max-w-[140px] ml-3 translate-x-0"
                  : "opacity-0 max-w-0 ml-0 -translate-x-2 pointer-events-none"
              }`}
            >
              <span className="font-bold text-amber-400">{userStats?.daily_streak ?? 1}</span>
              <span className="text-slate-400 text-meta font-mono">hari streak</span>
            </div>
          </div>

          {/* Dedicated Import Materi Button with + logo */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} transition={SPRING_SNAPPY}>
            <Link
              href="/import"
              onClick={(e) => e.stopPropagation()}
              title="Import / Tambah Materi AI (+)"
              className={`w-full flex items-center h-9 rounded px-2.5 transition-colors overflow-hidden group ${
                pathname === "/import"
                  ? "bg-primary/20 text-primary border border-primary/40 font-medium"
                  : "text-slate-300 hover:text-white hover:bg-elevated border border-dashed border-border-def hover:border-primary/50"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 shrink-0 text-primary transition-transform group-hover:scale-125 group-hover:rotate-90 duration-200" />
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ease-out whitespace-nowrap ${
                  isOpen
                    ? "opacity-100 max-w-[140px] ml-3 translate-x-0"
                    : "opacity-0 max-w-0 ml-0 -translate-x-2 pointer-events-none"
                }`}
              >
                <span className="text-label truncate font-medium block">Tambah Modul</span>
              </div>
            </Link>
          </motion.div>

          {/* Onboarding Guide Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={SPRING_SNAPPY}
            onClick={(e) => {
              e.stopPropagation();
              setIsOnboardingOpen(true);
            }}
            title="Panduan Onboarding Axion"
            className="w-full flex items-center h-9 rounded px-2.5 text-slate-400 hover:text-slate-100 hover:bg-elevated transition-colors overflow-hidden group"
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 shrink-0 text-primary transition-transform group-hover:rotate-45 duration-300" />
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ease-out whitespace-nowrap ${
                isOpen
                  ? "opacity-100 max-w-[140px] ml-3 translate-x-0"
                  : "opacity-0 max-w-0 ml-0 -translate-x-2 pointer-events-none"
              }`}
            >
              <span className="text-label truncate font-medium block">Panduan Onboarding</span>
            </div>
          </motion.button>

          {/* Unified Settings Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={SPRING_SNAPPY}
            onClick={(e) => {
              e.stopPropagation();
              setIsSettingsOpen(true);
            }}
            title="Pengaturan (Akun, Cadangan Export, Kaggle, Codeforces)"
            className="w-full flex items-center h-9 rounded px-2.5 text-slate-400 hover:text-slate-100 hover:bg-elevated transition-colors overflow-hidden group"
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <Settings className="w-4 h-4 shrink-0 text-slate-300 transition-transform group-hover:rotate-90 duration-300" />
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ease-out whitespace-nowrap ${
                isOpen
                  ? "opacity-100 max-w-[140px] ml-3 translate-x-0"
                  : "opacity-0 max-w-0 ml-0 -translate-x-2 pointer-events-none"
              }`}
            >
              <span className="text-label truncate font-medium block">Pengaturan</span>
            </div>
          </motion.button>
        </div>
      </aside>

      {/* Unified Settings Modal */}
      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Onboarding Guide Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </>
  );
};
