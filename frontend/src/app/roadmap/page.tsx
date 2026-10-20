"use client";

import React, { useEffect, useState } from "react";
import { ModuleItem, RoadmapSection } from "@/components/roadmap/RoadmapSection";

export default function RoadmapPage() {
  const [curriculum, setCurriculum] = useState<ModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/v1/curriculum")
      .then((res) => res.json())
      .then((data) => setCurriculum(data))
      .catch((err) => console.error("Error fetching curriculum:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-root">
      <div className="max-w-6xl mx-auto space-y-6">
        {isLoading ? (
          <div className="p-16 text-center text-slate-500 font-mono flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Memuat roadmap kurikulum 3 sektor...</span>
          </div>
        ) : (
          <RoadmapSection curriculum={curriculum} />
        )}
      </div>
    </div>
  );
}
