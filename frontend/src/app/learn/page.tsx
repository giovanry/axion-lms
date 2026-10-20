"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SplitScreenLayout } from "@/components/learn/SplitScreenLayout";
import { useLmsStore } from "@/stores/useLmsStore";

function LearnContent() {
  const searchParams = useSearchParams();
  const requestedLesson = searchParams.get("lesson");

  const [curriculumTree, setCurriculumTree] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { activeLessonId, setActiveLessonId, setActiveLesson, setUserStats } = useLmsStore();

  useEffect(() => {
    // Fetch initial user profile & streak
    fetch("/api/v1/user/stats")
      .then((res) => res.json())
      .then((data) => setUserStats(data))
      .catch((err) => console.error("Error fetching stats:", err));

    // Fetch curriculum tree
    fetch("/api/v1/curriculum")
      .then((res) => res.json())
      .then((data) => {
        setCurriculumTree(data);
        const targetId = requestedLesson || activeLessonId || (data.length > 0 && data[0].lessons.length > 0 ? data[0].lessons[0].id : null);
        if (targetId) {
          handleSelectLesson(targetId);
        }
      })
      .catch((err) => console.error("Error fetching curriculum:", err))
      .finally(() => setIsLoading(false));
  }, [requestedLesson]);

  const handleSelectLesson = async (lessonId: string) => {
    setActiveLessonId(lessonId);
    try {
      const res = await fetch(`/api/v1/lessons/${lessonId}`);
      if (res.ok) {
        const detail = await res.json();
        setActiveLesson(detail);
      }
    } catch (err) {
      console.error("Error fetching lesson detail:", err);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="learn-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 h-screen flex items-center justify-center font-mono text-label text-slate-500 bg-root"
        >
          Memuat materi kurikulum Axion...
        </motion.div>
      ) : (
        <motion.div
          key="learn-ready"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="flex-1 h-screen flex flex-col overflow-hidden"
        >
          <SplitScreenLayout
            curriculumTree={curriculumTree}
            onSelectLesson={handleSelectLesson}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center font-mono text-label text-slate-500 bg-root">
          Menyiapkan ruang belajar...
        </div>
      }
    >
      <LearnContent />
    </Suspense>
  );
}
