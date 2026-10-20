import json
import logging
import math
import re
from typing import Any, Dict, List, Optional
import httpx
from pydantic import BaseModel
from backend.app.core.config import settings

logger = logging.getLogger(__name__)


class YouTubeTranscriptRequest(BaseModel):
    video_url: str


class SocraticChatHistoryItem(BaseModel):
    role: str  # "user" | "gemini" | "ollama" | "system"
    text: str


class SocraticChatRequest(BaseModel):
    prompt: str
    mode: str = "SOCRATIC_DEBUGGER"  # "SOCRATIC_DEBUGGER" | "MATH_TO_CODE" | "EKKA_OSN_EXAMINER"
    lesson_id: Optional[str] = None
    lesson_title: Optional[str] = None
    track_title: Optional[str] = None
    active_code: Optional[str] = None
    error_traceback: Optional[str] = None
    video_timestamp: Optional[str] = None
    transcript_context: Optional[str] = None
    history: Optional[List[SocraticChatHistoryItem]] = None


class SocraticAIService:
    @staticmethod
    def extract_youtube_video_id(url_or_id: str) -> Optional[str]:
        clean = url_or_id.strip()
        if not clean:
            return None
        if re.match(r"^[a-zA-Z0-9_-]{11}$", clean):
            return clean
        v_match = re.search(r"[?&]v=([a-zA-Z0-9_-]{11})", clean)
        if v_match:
            return v_match.group(1)
        be_match = re.search(r"youtu\.be/([a-zA-Z0-9_-]{11})", clean)
        if be_match:
            return be_match.group(1)
        embed_match = re.search(r"embed/([a-zA-Z0-9_-]{11})", clean)
        if embed_match:
            return embed_match.group(1)
        return None

    def fetch_youtube_transcript(self, url_or_id: str) -> Dict[str, Any]:
        video_id = self.extract_youtube_video_id(url_or_id)
        if not video_id:
            return {
                "success": False,
                "error": "URL atau Video ID YouTube tidak valid.",
                "transcript": [],
                "full_text": "",
            }

        try:
            from youtube_transcript_api import YouTubeTranscriptApi
            api = YouTubeTranscriptApi()

            # First attempt with preference for Indonesian & English
            fetched = None
            try:
                fetched = api.fetch(video_id, languages=("id", "en", "en-US"))
            except Exception:
                # If specific languages fail, attempt to inspect transcript list
                try:
                    transcript_list = api.list(video_id)
                    for t in transcript_list:
                        fetched = t.fetch()
                        break
                except Exception as list_err:
                    logger.warning("Could not list transcripts: %s", list_err)

            if not fetched:
                return {
                    "success": False,
                    "video_id": video_id,
                    "error": "Transkrip tidak tersedia untuk video ini (dinonaktifkan oleh uploader atau otomatis tidak tersedia).",
                    "transcript": [],
                    "full_text": "",
                }

            items = []
            full_text_lines = []
            for snip in fetched:
                start_sec = getattr(snip, "start", 0.0)
                mins = int(start_sec // 60)
                secs = int(start_sec % 60)
                time_str = f"{mins:02d}:{secs:02d}"
                text = getattr(snip, "text", "").strip()

                items.append({
                    "start": start_sec,
                    "time_formatted": time_str,
                    "text": text,
                })
                full_text_lines.append(f"[{time_str}] {text}")

            full_text = "\n".join(full_text_lines)
            return {
                "success": True,
                "video_id": video_id,
                "total_segments": len(items),
                "transcript": items[:150],  # Return up to 150 items to keep payload snappy
                "full_text": full_text[:8000],
            }

        except Exception as e:
            logger.error("Error retrieving YouTube transcript for %s: %s", video_id, e)
            return {
                "success": False,
                "video_id": video_id,
                "error": f"Gagal mengambil transkrip: {str(e)}",
                "transcript": [],
                "full_text": "",
            }

    def _build_system_prompt(self, mode: str) -> str:
        base_identity = (
            "Anda adalah Axion Socratic Tutor, mentor kecerdasan buatan dan matematika komputasi elit "
            "untuk Siswa Axion, seorang pembelajar berbakat dengan fondasi matematika murni yang kuat (aljabar linear, kalkulus, "
            "probabilitas) yang sedang mempersiapkan diri untuk Olimpiade Sains Nasional bidang Kecerdasan Artifisial (EKKA OSN). "
            "Siswa sedang mempelajari implementasi Python, NumPy, Pandas, dan PyTorch dari nol.\n"
            "Gunakan Bahasa Indonesia yang teknis, elegan, presisi, dan bersahabat."
        )

        if mode == "SOCRATIC_DEBUGGER":
            mode_rules = (
                "\n--- MODE: SOCRATIC DEBUGGER (STRICT ANTI-SPOILER GUARD) ---\n"
                "ATURAN MUTLAK:\n"
                "1. JANGAN PERNAH memberikan blok kode solusi yang sudah diperbaiki secara lengkap. Ini melanggar protokol kognitif Axion.\n"
                "2. Hubungkan kesalahan kode dengan konsep matematika murninya (misalnya: dimensi tensor, aturan perkalian matriks, "
                "penyiaran/broadcasting axis, zero division, atau tipe data float32/int64).\n"
                "3. Ajukan 1-2 pertanyaan Socratic tajam yang membimbing Siswa untuk memeriksa baris kode penyebab dan menyadari kesalahannya sendiri.\n"
                "4. Berikan petunjuk konseptual bertahap (hint), bukan jawaban mentah."
            )
        elif mode == "MATH_TO_CODE":
            mode_rules = (
                "\n--- MODE: MATH-TO-CODE BRIDGE ---\n"
                "TUGAS UTAMA:\n"
                "1. Terjemahkan formulasi matematika murni (simbol LaTeX, notasi tensor, dot product, normalisasi, gradien) "
                "ke dalam kode Python / NumPy / PyTorch yang tervektorisasi murni (tanpa loop for manual).\n"
                "2. Tuliskan rumus matematika dalam LaTeX ($...$ atau $$...$$) lalu sertakan cuplikan kode minimalis berefisiensi tinggi.\n"
                "3. Jelaskan keselarasan dimensi matriks (shape) dan mengapa kode tervektorisasi lebih cepat dan hemat memori."
            )
        else:  # EKKA_OSN_EXAMINER
            mode_rules = (
                "\n--- MODE: EKKA OSN EXAMINER ---\n"
                "TUGAS UTAMA:\n"
                "1. Uji pemahaman konseptual dan batas kritis (edge cases) Siswa untuk standar olimpiade sains AI tingkat nasional.\n"
                "2. Tanyakan kasus khusus seperti: matriks singular (determinan nol), multikolinearitas, kestabilan numerik (epsilon pada log/divisi), "
                "vanishing/exploding gradient, atau trade-off bias-variance.\n"
                "3. Nilai jawaban pengguna dengan standar ketat namun mendidik."
            )

        return base_identity + mode_rules

    def _build_context_prompt(self, req: SocraticChatRequest) -> str:
        parts = []
        if req.lesson_title:
            parts.append(f"Materi Aktif: {req.lesson_title} ({req.track_title or 'Track Axion'})")
        if req.video_timestamp:
            parts.append(f"Timestamp Video YouTube: {req.video_timestamp}")
        if req.active_code:
            parts.append(f"Kode Aktif di Editor Siswa:\n```python\n{req.active_code.strip()[:2000]}\n```")
        if req.error_traceback:
            parts.append(f"Pesan Error / Traceback Terakhir:\n```\n{req.error_traceback.strip()[:1500]}\n```")
        if req.transcript_context:
            parts.append(f"Konteks Transkrip Video Sekitar Detik Tersebut:\n\"\"\"{req.transcript_context[:1000]}\"\"\"")

        context_str = "\n\n".join(parts)
        user_msg = f"Pertanyaan / Perkataan Siswa:\n{req.prompt}"

        if context_str:
            return f"--- KONTEKS AKTIF WORKSPACE ---\n{context_str}\n\n--- PERTANYAAN USER ---\n{user_msg}"
        return user_msg

    async def chat(self, req: SocraticChatRequest) -> Dict[str, Any]:
        system_prompt = self._build_system_prompt(req.mode)
        user_prompt = self._build_context_prompt(req)

        # 1. Try Gemini Cloud AI (Primary: Gemini 3.6 Flash / Candidate Models)
        if settings.gemini_api_key:
            candidate_models = [
                settings.gemini_model,
                "gemini-2.5-flash",
                "gemini-1.5-flash",
                "gemini-2.0-flash",
            ]
            # Deduplicate while preserving order
            seen = set()
            models_to_try = []
            for m in candidate_models:
                if m and m not in seen:
                    seen.add(m)
                    models_to_try.append(m)

            for model in models_to_try:
                url = f"{settings.gemini_base_url}/models/{model}:generateContent?key={settings.gemini_api_key}"
                contents = []

                # Include previous conversation turns if provided
                if req.history:
                    for h in req.history[-6:]:  # Keep last 6 turns for memory context
                        role = "user" if h.role == "user" else "model"
                        contents.append({"role": role, "parts": [{"text": h.text}]})

                contents.append({"role": "user", "parts": [{"text": user_prompt}]})

                payload = {
                    "systemInstruction": {"parts": [{"text": system_prompt}]},
                    "contents": contents,
                    "generationConfig": {
                        "temperature": 0.4,
                        "maxOutputTokens": 1024,
                    },
                }

                try:
                    async with httpx.AsyncClient(timeout=20.0) as client:
                        resp = await client.post(url, json=payload)
                        if resp.status_code == 200:
                            data = resp.json()
                            reply = (
                                data.get("candidates", [{}])[0]
                                .get("content", {})
                                .get("parts", [{}])[0]
                                .get("text", "")
                            )
                            if reply.strip():
                                return {
                                    "success": True,
                                    "reply": reply.strip(),
                                    "provider": "gemini",
                                    "model": model,
                                    "mode": req.mode,
                                }
                        logger.warning("Gemini model %s returned status %d. Trying next.", model, resp.status_code)
                except Exception as e:
                    logger.warning("Gemini model %s failed: %s. Trying next.", model, e)
                    continue

        # 2. Fallback to Local Ollama
        try:
            ollama_url = f"{settings.ollama_base_url}/api/generate"
            ollama_payload = {
                "model": settings.ollama_model,
                "system": system_prompt,
                "prompt": user_prompt,
                "stream": False,
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(ollama_url, json=ollama_payload)
                if resp.status_code == 200:
                    data = resp.json()
                    reply = data.get("response", "").strip()
                    if reply:
                        return {
                            "success": True,
                            "reply": reply,
                            "provider": "ollama",
                            "model": settings.ollama_model,
                            "mode": req.mode,
                        }
        except Exception as ollama_err:
            logger.warning("Ollama fallback failed: %s", ollama_err)

        # 3. Graceful offline heuristic if neither AI is reachable
        fallback_msg = (
            "Perhatian: Kredensial Gemini API atau Ollama lokal saat ini tidak merespons. "
            "Namun berdasarkan prinsip aljabar linear untuk modul ini: "
            "Pastikan Anda telah memeriksa keselarasan dimensi matriks $A \\in \\mathbb{R}^{m \\times k}$ "
            "dan $B \\in \\mathbb{R}^{k \\times n}$ sehingga menghasilkan $C \\in \\mathbb{R}^{m \\times n}$. "
            "Coba cetak atribut `.shape` dari setiap variabel sebelum melakukan operasi."
        )
        return {
            "success": True,
            "reply": fallback_msg,
            "provider": "offline_heuristic",
            "model": "rule_based_fallback",
            "mode": req.mode,
        }


socratic_service = SocraticAIService()
