import { create } from "zustand";

export interface MathBridgeItem {
  id: string;
  concept_name: string;
  latex_formula: string;
  tensor_dimensions: string;
  python_vectorized_code: string;
  explanation: string;
}

export interface AxionLesson {
  id: string;
  module_id: string;
  module_title: string;
  track_id: string;
  track_title: string;
  title: string;
  type: "CODING" | "THEORY" | "JUPYTER_PROJECT";
  content_path: string;
  video_url?: string;
  video_id?: string;
  starter_code?: string;
  test_assertions?: string;
  markdown_content?: string;
  is_completed?: boolean;
  math_bridges?: MathBridgeItem[];
  quiz?: {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
  };
}

export interface AxionModule {
  id: string;
  track_id: string;
  title: string;
  description: string;
  level: string;
  estimated_hours: number;
  lessons: AxionLesson[];
}

export interface AxionTrack {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  modules: AxionModule[];
}

export type AiCognitiveMode = "SOCRATIC_DEBUGGER" | "MATH_TO_CODE" | "EKKA_OSN_EXAMINER";

export interface ChatMessage {
  id: string;
  sender: "user" | "gemini" | "ollama" | "system";
  text: string;
  timestamp: string;
  codeSnippet?: string;
  isHint?: boolean;
}

interface AxionStoreState {
  // Navigation & 4-Zone state
  isSidebarOpen: boolean;
  isAiPanelOpen: boolean;
  activeTrackId: string;
  activeLessonId: string;
  activeLesson: AxionLesson | null;
  curriculum: AxionModule[];
  tracks: AxionTrack[];
  
  // Guided HUD
  nextBestLesson: { id: string; title: string; trackTitle: string } | null;

  // Video & Math state
  currentVideoTime: number;
  isVideoMiniPlayer: boolean;

  // Python Execution Sandbox State
  notebookCells: Array<{ id: string; code: string; output: string | null; error: string | null; plot: string | null }>;
  isExecuting: boolean;
  lastExecutionResult: { status: "IDLE" | "SUCCESS" | "ERROR" | "PASSED"; message?: string } | null;

  // Socratic AI State
  aiMode: AiCognitiveMode;
  aiStatus: "ONLINE_GEMINI" | "FALLBACK_OLLAMA" | "OFFLINE";
  chatHistory: ChatMessage[];
  isAiThinking: boolean;
  activeBadges: {
    cell: string | null;
    video: string | null;
    dataset: string | null;
  };

  // Axion Vault & Modals
  isVaultOpen: boolean;
  isSmartDropzoneOpen: boolean;
  isKaggleHubOpen: boolean;

  // User Profile (Giovanry)
  userProfile: {
    name: string;
    streakDays: number;
    hoursLearned: number;
    osnReadinessScore: number;
    kaggleConnected: boolean;
  };

  // Actions
  toggleSidebar: (open?: boolean) => void;
  toggleAiPanel: (open?: boolean) => void;
  setActiveLessonId: (id: string) => void;
  setActiveLesson: (lesson: AxionLesson | null) => void;
  setCurriculum: (modules: AxionModule[]) => void;
  setCurrentVideoTime: (seconds: number) => void;
  setIsVideoMiniPlayer: (mini: boolean) => void;
  setAiMode: (mode: AiCognitiveMode) => void;
  addChatMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearChat: () => void;
  setIsAiThinking: (thinking: boolean) => void;
  setAiStatus: (status: "ONLINE_GEMINI" | "FALLBACK_OLLAMA" | "OFFLINE") => void;
  setVaultOpen: (open: boolean) => void;
  setSmartDropzoneOpen: (open: boolean) => void;
  setKaggleHubOpen: (open: boolean) => void;
  updateExecutionResult: (res: { status: "IDLE" | "SUCCESS" | "ERROR" | "PASSED"; message?: string }) => void;
  setUserProfile: (profile: Partial<AxionStoreState["userProfile"]>) => void;
  resumeNextLesson: () => void;
}

export const useAxionStore = create<AxionStoreState>((set, get) => ({
  isSidebarOpen: true,
  isAiPanelOpen: true,
  activeTrackId: "track_02_linear_algebra",
  activeLessonId: "ds_01_numpy_vectorization",
  activeLesson: null,
  curriculum: [],
  tracks: [],
  nextBestLesson: {
    id: "ds_01_numpy_vectorization",
    title: "2.1 Perkalian Matriks NumPy & Broadcasting",
    trackTitle: "Track 2: Aljabar Linear Numerik & Vektorisasi Array",
  },
  currentVideoTime: 0,
  isVideoMiniPlayer: false,
  notebookCells: [
    {
      id: "cell_1",
      code: "import numpy as np\n\n# Memeriksa operasi dot product dan dimensi matriks\nA = np.array([[1, 2], [3, 4]])\nB = np.array([[5, 6], [7, 8]])\nC = np.dot(A, B)\nprint('Hasil Perkalian Matriks C:\\n', C)",
      output: null,
      error: null,
      plot: null,
    },
  ],
  isExecuting: false,
  lastExecutionResult: null,

  aiMode: "SOCRATIC_DEBUGGER",
  aiStatus: "ONLINE_GEMINI",
  chatHistory: [
    {
      id: "init_1",
      sender: "system",
      text: "Protokol Socratic AI Aktif. Gemini 3.6 Flash siap memandu Anda menjembatani matematika ke kode Python tanpa spoiler solusi.",
      timestamp: "10:00",
    },
  ],
  isAiThinking: false,
  activeBadges: {
    cell: "In[1] Perkalian Matriks",
    video: "02:15 Matriks & Vektor",
    dataset: null,
  },

  isVaultOpen: false,
  isSmartDropzoneOpen: false,
  isKaggleHubOpen: false,

  userProfile: {
    name: "Axion Scholar",
    streakDays: 0,
    hoursLearned: 0,
    osnReadinessScore: 50,
    kaggleConnected: false,
  },

  toggleSidebar: (open) =>
    set((s) => ({ isSidebarOpen: open !== undefined ? open : !s.isSidebarOpen })),
  toggleAiPanel: (open) =>
    set((s) => ({ isAiPanelOpen: open !== undefined ? open : !s.isAiPanelOpen })),
  setActiveLessonId: (id) => set({ activeLessonId: id }),
  setActiveLesson: (lesson) => set({ activeLesson: lesson }),
  setCurriculum: (modules) => set({ curriculum: modules }),
  setCurrentVideoTime: (seconds) => set({ currentVideoTime: seconds }),
  setIsVideoMiniPlayer: (mini) => set({ isVideoMiniPlayer: mini }),
  setAiMode: (mode) => set({ aiMode: mode }),
  addChatMessage: (msg) =>
    set((s) => ({
      chatHistory: [
        ...s.chatHistory,
        {
          ...msg,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    })),
  clearChat: () => set({ chatHistory: [] }),
  setIsAiThinking: (thinking) => set({ isAiThinking: thinking }),
  setAiStatus: (status) => set({ aiStatus: status }),
  setVaultOpen: (open) => set({ isVaultOpen: open }),
  setSmartDropzoneOpen: (open) => set({ isSmartDropzoneOpen: open }),
  setKaggleHubOpen: (open) => set({ isKaggleHubOpen: open }),
  updateExecutionResult: (res) => set({ lastExecutionResult: res }),
  setUserProfile: (profile) =>
    set((s) => ({ userProfile: { ...s.userProfile, ...profile } })),
  resumeNextLesson: () => {
    const { nextBestLesson, setActiveLessonId } = get();
    if (nextBestLesson) {
      setActiveLessonId(nextBestLesson.id);
    }
  },
}));
