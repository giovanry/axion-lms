"use client";

import React, { useEffect } from "react";
import { Group, Panel, Separator, usePanelRef } from "react-resizable-panels";
import { useAxionStore } from "@/stores/useAxionStore";
import { TopCommandHeader } from "./TopCommandHeader";
import { Zona1CurriculumExplorer } from "@/components/zones/Zona1CurriculumExplorer";
import { Zona2TheoryAndVideo } from "@/components/zones/Zona2TheoryAndVideo";
import { Zona3NotebookSandbox } from "@/components/zones/Zona3NotebookSandbox";
import { Zona4SocraticTutor } from "@/components/zones/Zona4SocraticTutor";
import { AxionVaultModal } from "@/components/modals/AxionVaultModal";
import { SmartDropzoneModal } from "@/components/modals/SmartDropzoneModal";
import { KaggleHubModal } from "@/components/modals/KaggleHubModal";

export const AxionWorkspaceShell: React.FC = () => {
  const {
    isSidebarOpen,
    toggleSidebar,
    isAiPanelOpen,
    toggleAiPanel,
    resumeNextLesson,
  } = useAxionStore();

  const sidebarPanelRef = usePanelRef();
  const aiPanelRef = usePanelRef();

  // Sync panel collapse with store
  useEffect(() => {
    if (sidebarPanelRef.current) {
      if (isSidebarOpen) {
        sidebarPanelRef.current.expand();
      } else {
        sidebarPanelRef.current.collapse();
      }
    }
  }, [isSidebarOpen, sidebarPanelRef]);

  useEffect(() => {
    if (aiPanelRef.current) {
      if (isAiPanelOpen) {
        aiPanelRef.current.expand();
      } else {
        aiPanelRef.current.collapse();
      }
    }
  }, [isAiPanelOpen, aiPanelRef]);

  // Global Keyboard Shortcuts (Cmd+B, Cmd+J, Shift+Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Sidebar: Cmd+B or Ctrl+B
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }

      // Toggle Socratic AI Panel: Cmd+J or Ctrl+J
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        toggleAiPanel();
      }

      // Quick Resume Next Lesson: Shift + Space
      if (e.shiftKey && e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        resumeNextLesson();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar, toggleAiPanel, resumeNextLesson]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-zinc-950 text-zinc-100 font-sans select-none">
      {/* Top Command Header with Guided HUD */}
      <TopCommandHeader />

      {/* 4-Zone Resizable IDE Canvas */}
      <main className="flex-1 w-full h-[calc(100vh-48px)] overflow-hidden">
        <Group
          orientation="horizontal"
          id="axion-workspace-layout-v2"
          className="h-full w-full"
        >
          {/* Zona 1: Curriculum Explorer & Data Tree */}
          <Panel
            panelRef={sidebarPanelRef}
            defaultSize="18%"
            minSize="12%"
            maxSize="28%"
            collapsible={true}
            className="h-full overflow-hidden"
          >
            <Zona1CurriculumExplorer />
          </Panel>

          <Separator className="w-1 hover:w-1.5 transition-all bg-zinc-850 hover:bg-indigo-500 cursor-col-resize shrink-0" />

          {/* Zona 2: Dockable YouTube Theatre & Math-to-Code Theory */}
          <Panel defaultSize="34%" minSize="25%" className="h-full overflow-hidden">
            <Zona2TheoryAndVideo />
          </Panel>

          <Separator className="w-1 hover:w-1.5 transition-all bg-zinc-850 hover:bg-indigo-500 cursor-col-resize shrink-0" />

          {/* Zona 3: Interactive Notebook Sandbox & Auto-Grader */}
          <Panel defaultSize="30%" minSize="24%" className="h-full overflow-hidden">
            <Zona3NotebookSandbox />
          </Panel>

          <Separator className="w-1 hover:w-1.5 transition-all bg-zinc-850 hover:bg-indigo-500 cursor-col-resize shrink-0" />

          {/* Zona 4: Socratic AI Tutor & Context Inspector */}
          <Panel
            panelRef={aiPanelRef}
            defaultSize="18%"
            minSize="14%"
            maxSize="30%"
            collapsible={true}
            className="h-full overflow-hidden"
          >
            <Zona4SocraticTutor />
          </Panel>
        </Group>
      </main>

      {/* Axion Modals */}
      <AxionVaultModal />
      <SmartDropzoneModal />
      <KaggleHubModal />
    </div>
  );
};
