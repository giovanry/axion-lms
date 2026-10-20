import { create } from "zustand";

export interface LessonDetail {
  id: string;
  module_id: string;
  module_title: string;
  title: string;
  type: "THEORY" | "CODING" | "JUPYTER_PROJECT";
  content_path: string;
  video_url?: string;
  starter_code?: string;
  test_assertions?: string;
  markdown_content?: string;
  is_completed?: boolean;
  quiz?: {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
  };
}

export interface UserStats {
  id: number;
  name: string;
  daily_streak: number;
  last_active_date: string | null;
  codeforces_handle?: string | null;
  kaggle_username?: string | null;
  has_kaggle?: boolean;
  completed_lessons?: number;
  hours_learned?: number;
  osn_readiness_score?: number;
}

interface LmsStoreState {
  activeLessonId: string | null;
  activeLesson: LessonDetail | null;
  rightPaneMode: "NOTES" | "CODE" | "QUIZ";
  currentVideoTime: number;
  userStats: UserStats | null;
  isAiDrawerOpen: boolean;
  aiContext: { code: string; errorOutput: string; title: string; transcriptContext?: string };

  setActiveLessonId: (id: string | null) => void;
  setActiveLesson: (lesson: LessonDetail | null) => void;
  setRightPaneMode: (mode: "NOTES" | "CODE" | "QUIZ") => void;
  setCurrentVideoTime: (timeSec: number) => void;
  setUserStats: (stats: UserStats | null) => void;
  toggleAiDrawer: (open?: boolean) => void;
  setAiContext: (context: { title: string; code?: string; errorOutput?: string; transcriptContext?: string }) => void;
}

export const useLmsStore = create<LmsStoreState>((set) => ({
  activeLessonId: "py_01_syntax",
  activeLesson: null,
  rightPaneMode: "CODE",
  currentVideoTime: 0,
  userStats: { id: 1, name: "Axion Scholar", daily_streak: 0, last_active_date: null },
  isAiDrawerOpen: false,
  aiContext: { code: "", errorOutput: "", title: "", transcriptContext: "" },

  setActiveLessonId: (id) => set({ activeLessonId: id }),
  setActiveLesson: (lesson) => {
    const defaultMode = lesson?.type === "THEORY" ? "QUIZ" : "CODE";
    set({ activeLesson: lesson, rightPaneMode: defaultMode });
  },
  setRightPaneMode: (mode) => set({ rightPaneMode: mode }),
  setCurrentVideoTime: (timeSec) => set({ currentVideoTime: timeSec }),
  setUserStats: (stats) => set({ userStats: stats }),
  toggleAiDrawer: (open) => set((s) => ({ isAiDrawerOpen: open !== undefined ? open : !s.isAiDrawerOpen })),
  setAiContext: (context) =>
    set((s) => ({
      aiContext: {
        code: context.code ?? s.aiContext.code ?? "",
        errorOutput: context.errorOutput ?? s.aiContext.errorOutput ?? "",
        title: context.title,
        transcriptContext: context.transcriptContext ?? s.aiContext.transcriptContext ?? "",
      },
      isAiDrawerOpen: true,
    })),
}));
