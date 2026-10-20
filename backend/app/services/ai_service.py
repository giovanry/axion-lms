import json
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional
import httpx
from backend.app.core.config import settings

logger = logging.getLogger(__name__)


def _get_gemini_candidate_models() -> List[str]:
    primary = settings.gemini_model.strip()
    fallbacks = [m.strip() for m in settings.gemini_fallback_models.split(",") if m.strip()]
    candidates = [primary]
    for fb in fallbacks:
        if fb not in candidates:
            candidates.append(fb)
    return candidates


async def check_gemini_status() -> bool:
    if not settings.gemini_api_key:
        return False
    try:
        url = f"{settings.gemini_base_url}/models?key={settings.gemini_api_key}"
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            # 200 means active, 503 means service reachable but busy
            return resp.status_code in [200, 503]
    except Exception:
        return False


async def check_ollama_status() -> bool:
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(f"{settings.ollama_base_url}/api/tags")
            return resp.status_code == 200
    except Exception:
        return False


async def check_ai_status() -> Dict[str, Any]:
    gemini_ok = await check_gemini_status()
    ollama_ok = await check_ollama_status()

    active_service = "Tidak Aktif"
    active_model = None
    if gemini_ok:
        active_service = f"Gemini Cloud AI ({settings.gemini_model})"
        active_model = settings.gemini_model
    elif ollama_ok:
        active_service = f"Ollama Local Engine ({settings.ollama_model})"
        active_model = settings.ollama_model

    return {
        "active": gemini_ok or ollama_ok,
        "primary_provider": "gemini",
        "gemini_active": gemini_ok,
        "gemini_model": settings.gemini_model,
        "ollama_active": ollama_ok,
        "ollama_model": settings.ollama_model,
        "service": active_service,
        "model": active_model or settings.gemini_model,
    }


async def stream_explain_error(
    code: str,
    error_output: str,
    context: Optional[str] = None,
) -> AsyncGenerator[str, None]:
    system_prompt = (
        "Anda adalah Olympus Tutor, mentor ahli pemrograman Python, Data Science, dan AI. "
        "Jelaskan penyebab runtime error atau bug logika secara ringkas, ramah, dan berikan petunjuk (hint) "
        "yang konstruktif dalam Bahasa Indonesia. Jangan langsung memberikan seluruh kode jawaban akhir, "
        "dorong pemikiran kritis pembelajar. Jaga penjelasan tetap terstruktur, teknis, dan presisi."
    )
    user_prompt = (
        f"Konteks Latihan: {context or 'Python Exercise'}\n\n"
        f"Kode Program:\n```python\n{code}\n```\n\n"
        f"Pesan Error:\n```\n{error_output}\n```\n\n"
        "Mohon jelaskan mengapa error ini terjadi dan berikan petunjuk langkah demi langkah untuk memperbaikinya."
    )

    # 1. Attempt Gemini Cloud API (Primary: Gemini 3.6, with Fallback Models)
    if settings.gemini_api_key:
        candidate_models = _get_gemini_candidate_models()
        for model in candidate_models:
            url = f"{settings.gemini_base_url}/models/{model}:streamGenerateContent?alt=sse&key={settings.gemini_api_key}"
            payload = {
                "systemInstruction": {
                    "parts": [{"text": system_prompt}]
                },
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": user_prompt}]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.3
                }
            }

            try:
                async with httpx.AsyncClient(timeout=45.0) as client:
                    async with client.stream("POST", url, json=payload) as response:
                        if response.status_code == 200:
                            streamed_any = False
                            async for line in response.aiter_lines():
                                if not line:
                                    continue
                                if line.startswith("data: "):
                                    raw_json = line[6:].strip()
                                    if raw_json == "[DONE]":
                                        break
                                    try:
                                        chunk = json.loads(raw_json)
                                        parts = (
                                            chunk.get("candidates", [{}])[0]
                                            .get("content", {})
                                            .get("parts", [])
                                        )
                                        for part in parts:
                                            token = part.get("text", "")
                                            if token:
                                                streamed_any = True
                                                yield token
                                    except Exception:
                                        continue
                            if streamed_any:
                                return
                        # If 503 (high demand) or 429, loop to next candidate model
                        logger.warning("Gemini model %s returned status %d. Trying next candidate.", model, response.status_code)
            except Exception as e:
                logger.warning("Gemini model %s failed: %s. Trying next candidate.", model, str(e))
                continue

    # 2. Fallback to Local Ollama (Llama 3)
    ollama_payload = {
        "model": settings.ollama_model,
        "prompt": f"{system_prompt}\n\nPengguna: {user_prompt}\nTutor:",
        "stream": True,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", f"{settings.ollama_base_url}/api/generate", json=ollama_payload) as response:
                if response.status_code == 200:
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            data = json.loads(line)
                            token = data.get("response", "")
                            if token:
                                yield token
                            if data.get("done", False):
                                break
                        except json.JSONDecodeError:
                            continue
                    return
    except Exception:
        pass

    # 3. Static Analysis Fallback if both cloud Gemini and local Ollama are unreachable
    yield (
        "Olympus Tutor AI (Gemini 3.6 / Ollama) sedang tidak dapat dijangkau secara langsung.\n\n"
        "Petunjuk Analisis Statis:\n"
        f"Pesan error yang terdeteksi:\n```\n{error_output[:400]}\n```\n\n"
        "Saran perbaikan: Periksa kembali baris kode tempat terjadinya error, pastikan nama variabel dan tipe data yang digunakan sudah sesuai."
    )


async def translate_problem_to_indonesian(
    title: str,
    statement_en: str,
    input_spec_en: str,
    output_spec_en: str,
) -> Dict[str, str]:
    prompt = (
        "Anda adalah penerjemah soal competitive programming profesional. "
        "Terjemahkan soal berikut ke dalam Bahasa Indonesia yang formal, ringkas, dan jelas, "
        "sesuai terminologi standar Olimpiade Sains Nasional (OSN) dan TOKI. "
        "Pertahankan nama variabel matematika, batasan angka, serta format input/output persis apa adanya.\n\n"
        f"Judul: {title}\n\n"
        f"Deskripsi Masalah:\n{statement_en}\n\n"
        f"Format Masukan:\n{input_spec_en}\n\n"
        f"Format Keluaran:\n{output_spec_en}\n\n"
        "Balas HANYA dalam format JSON valid dengan struktur persis berikut:\n"
        "{\n"
        '  "title_id": "...",\n'
        '  "statement_id": "...",\n'
        '  "input_specification_id": "...",\n'
        '  "output_specification_id": "..."\n'
        "}"
    )

    # 1. Attempt Gemini Cloud API (Primary: Gemini 3.6)
    if settings.gemini_api_key:
        candidate_models = _get_gemini_candidate_models()
        for model in candidate_models:
            url = f"{settings.gemini_base_url}/models/{model}:generateContent?key={settings.gemini_api_key}"
            payload = {
                "systemInstruction": {
                    "parts": [{"text": "Anda adalah penerjemah soal competitive programming profesional."}]
                },
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": prompt}]
                    }
                ],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "temperature": 0.2
                }
            }

            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        raw_json = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                        data = json.loads(raw_json)
                        return {
                            "title_id": data.get("title_id", title),
                            "statement_id": data.get("statement_id", statement_en),
                            "input_specification_id": data.get("input_specification_id", input_spec_en),
                            "output_specification_id": data.get("output_specification_id", output_spec_en),
                        }
            except Exception as e:
                logger.warning("Gemini translate error with %s: %s", model, e)
                continue

    # 2. Fallback to Local Ollama
    ollama_payload = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
        "format": "json",
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{settings.ollama_base_url}/api/generate", json=ollama_payload)
            if resp.status_code == 200:
                raw_response = resp.json().get("response", "{}")
                data = json.loads(raw_response)
                return {
                    "title_id": data.get("title_id", title),
                    "statement_id": data.get("statement_id", statement_en),
                    "input_specification_id": data.get("input_specification_id", input_spec_en),
                    "output_specification_id": data.get("output_specification_id", output_spec_en),
                }
    except Exception:
        pass

    return {
        "title_id": title,
        "statement_id": f"[Terjemahan otomatis belum tersedia. Menampilkan teks asli]\n\n{statement_en}",
        "input_specification_id": input_spec_en,
        "output_specification_id": output_spec_en,
    }


def generate_eda_code(dataset_name: str, csv_filename: str, columns: List[str]) -> str:
    cols_repr = ", ".join([f"'{c}'" for c in columns[:10]])
    return f"""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Olympus Automated EDA for {dataset_name}
# Target CSV: {csv_filename}
df = pd.read_csv('{csv_filename}')

print("--- Dataset Shape ---")
print(df.shape)

print("\\n--- Column Overview ---")
print(df.info())

print("\\n--- Statistical Summary ---")
print(df.describe())

print("\\n--- Missing Values ---")
print(df.isnull().sum())

# Detected sample columns: [{cols_repr}]
"""
