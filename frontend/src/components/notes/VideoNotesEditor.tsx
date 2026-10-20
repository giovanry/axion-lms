"use client";

import React, { useEffect, useState } from "react";
import { Clock, Plus, Save } from "lucide-react";
import { useLmsStore } from "@/stores/useLmsStore";

interface VideoNoteItem {
  id?: number;
  lesson_id: string;
  timestamp_seconds: number;
  note_text: string;
}

export const VideoNotesEditor: React.FC = () => {
  const { activeLesson, currentVideoTime } = useLmsStore();
  const [notes, setNotes] = useState<VideoNoteItem[]>([]);
  const [currentNote, setCurrentNote] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!activeLesson) return;
    fetch(`/api/v1/notes/${activeLesson.id}`)
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.error("Error fetching notes:", err));
  }, [activeLesson]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddTimestamp = () => {
    const tsStr = `[${formatSeconds(currentVideoTime)}] `;
    setCurrentNote((prev) => prev + tsStr);
  };

  const handleSaveNote = async () => {
    if (!activeLesson || !currentNote.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_id: activeLesson.id,
          timestamp_seconds: currentVideoTime,
          note_text: currentNote,
        }),
      });
      if (res.ok) {
        setNotes((prev) => [
          ...prev,
          {
            lesson_id: activeLesson.id,
            timestamp_seconds: currentVideoTime,
            note_text: currentNote,
          },
        ]);
        setCurrentNote("");
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface border-l border-border-def p-4 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border-def">
        <div>
          <h3 className="text-section-header text-slate-100">Catatan Interaktif Video</h3>
          <p className="text-meta text-slate-400">Catatan tersinkronisasi otomatis dengan timestamp video.</p>
        </div>

        <button
          onClick={handleAddTimestamp}
          className="flex items-center space-x-1 px-2.5 py-1 bg-elevated hover:bg-surface border border-border-def rounded text-label text-primary transition-colors"
          title="Sisipkan waktu video saat ini"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>+ [{formatSeconds(currentVideoTime)}]</span>
        </button>
      </div>

      {/* Note input area */}
      <div className="space-y-2">
        <textarea
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          placeholder="Tulis ringkasan atau catatan konsep di sini..."
          className="w-full h-24 p-3 bg-root border border-border-def rounded text-body text-slate-200 placeholder-slate-500 focus:border-primary focus:outline-none resize-none"
        />

        <div className="flex justify-end">
          <button
            onClick={handleSaveNote}
            disabled={isSaving || !currentNote.trim()}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded text-label font-medium transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Menyimpan..." : "Simpan Catatan"}</span>
          </button>
        </div>
      </div>

      {/* List of saved notes */}
      <div className="flex-1 overflow-y-auto space-y-2">
        <span className="text-meta text-slate-400 font-mono block mb-1">DAFTAR CATATAN TERSIMPAN</span>
        {notes.length === 0 ? (
          <div className="p-4 bg-root border border-border-def rounded text-center text-meta text-slate-500">
            Belum ada catatan untuk pelajaran ini. Tulis catatan saat video diputar.
          </div>
        ) : (
          notes.map((n, idx) => (
            <div key={idx} className="p-3 bg-elevated border border-border-def rounded space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 bg-primary-muted text-primary border border-primary/30 rounded text-meta font-mono">
                  {formatSeconds(n.timestamp_seconds)}
                </span>
              </div>
              <p className="text-body text-slate-200 whitespace-pre-wrap">{n.note_text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
