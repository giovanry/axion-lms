"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING_SNAPPY, EASE_OUT_EXPO } from "@/lib/motion-config";
import { BookOpen, Code2, HelpCircle, NotebookPen } from "lucide-react";
import { useLmsStore } from "@/stores/useLmsStore";
import { ContentPane } from "./ContentPane";
import { MonacoWorkspace } from "../editor/MonacoWorkspace";
import { VideoNotesEditor } from "../notes/VideoNotesEditor";
import { QuizViewer } from "./../assessments/QuizViewer";

interface SplitScreenLayoutProps {
  curriculumTree: any[];
  onSelectLesson: (id: string) => void;
}

export const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({
  curriculumTree,
  onSelectLesson,
}) => {
  const { activeLesson, rightPaneMode, setRightPaneMode } = useLmsStore();

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Left Pane: Theory & Video Content */}
      <div className="w-full md:w-1/2 h-full flex flex-col">
        <ContentPane
          curriculumTree={curriculumTree}
          onSelectLesson={onSelectLesson}
        />
      </div>

      {/* Right Pane: Interactive Workspace with Mode Toggle */}
      <div className="w-full md:w-1/2 h-full flex flex-col bg-surface border-l border-border-def">
        {/* Right Pane Navigation Header */}
        <div className="h-[40px] bg-elevated border-b border-border-def flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center space-x-1 relative">
            <button
              onClick={() => setRightPaneMode("CODE")}
              className={`relative flex items-center space-x-1.5 px-3 py-1 rounded text-label font-medium transition-colors z-10 ${
                rightPaneMode === "CODE"
                  ? "text-primary font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {rightPaneMode === "CODE" && (
                <motion.div
                  layoutId="learn-right-pane-pill"
                  className="absolute inset-0 bg-surface rounded border border-primary/30 -z-10 shadow-sm"
                  transition={SPRING_SNAPPY}
                />
              )}
              <Code2 className="w-3.5 h-3.5" />
              <span>Editor Kode</span>
            </button>

            <button
              onClick={() => setRightPaneMode("NOTES")}
              className={`relative flex items-center space-x-1.5 px-3 py-1 rounded text-label font-medium transition-colors z-10 ${
                rightPaneMode === "NOTES"
                  ? "text-primary font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {rightPaneMode === "NOTES" && (
                <motion.div
                  layoutId="learn-right-pane-pill"
                  className="absolute inset-0 bg-surface rounded border border-primary/30 -z-10 shadow-sm"
                  transition={SPRING_SNAPPY}
                />
              )}
              <NotebookPen className="w-3.5 h-3.5" />
              <span>Catatan Video</span>
            </button>

            {activeLesson?.quiz && (
              <button
                onClick={() => setRightPaneMode("QUIZ")}
                className={`relative flex items-center space-x-1.5 px-3 py-1 rounded text-label font-medium transition-colors z-10 ${
                  rightPaneMode === "QUIZ"
                    ? "text-primary font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {rightPaneMode === "QUIZ" && (
                  <motion.div
                    layoutId="learn-right-pane-pill"
                    className="absolute inset-0 bg-surface rounded border border-primary/30 -z-10 shadow-sm"
                    transition={SPRING_SNAPPY}
                  />
                )}
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Kuis Teori</span>
              </button>
            )}
          </div>

          <span className="text-meta text-slate-500 font-mono hidden sm:inline">
            Mode: {rightPaneMode}
          </span>
        </div>

        {/* Dynamic Mode Content with Smooth Fade In Out */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${rightPaneMode}-${activeLesson?.id || "default"}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
              className="w-full h-full"
            >
              {rightPaneMode === "CODE" && (
                <MonacoWorkspace
                  key={activeLesson?.id}
                  initialCode={activeLesson?.starter_code}
                  testAssertions={activeLesson?.test_assertions}
                />
              )}
              {rightPaneMode === "NOTES" && <VideoNotesEditor />}
              {rightPaneMode === "QUIZ" && <QuizViewer />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
