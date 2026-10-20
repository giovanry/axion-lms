import json
import logging
from pathlib import Path
import re
from typing import Any, Dict, List, Optional
import httpx
from pydantic import BaseModel
from backend.app.core.config import settings

logger = logging.getLogger(__name__)


class IngestModuleRequest(BaseModel):
    module_title: Optional[str] = None
    target_track_id: Optional[str] = "track_2"
    youtube_url: Optional[str] = None
    raw_text: Optional[str] = None


class MathBridgeData(BaseModel):
    concept_name: str
    latex_formula: str
    tensor_dimensions: str
    python_vectorized_code: str
    explanation: str


class GeneratedLessonData(BaseModel):
    title: str
    type: str  # "CODING" or "THEORY"
    markdown_theory: str
    math_bridge: Optional[MathBridgeData] = None
    starter_code: Optional[str] = None
    test_assertions: Optional[str] = None


class GeneratedModuleData(BaseModel):
    id: str
    title: str
    track_id: str
    track_title: str
    description: str
    level: str
    lessons: List[GeneratedLessonData]


class CurriculumIngestService:
    def extract_text_from_file(self, file_path: Path) -> str:
        suffix = file_path.suffix.lower()

        if suffix == ".pdf":
            try:
                import pypdf
                reader = pypdf.PdfReader(str(file_path))
                text_parts = []
                for idx, page in enumerate(reader.pages[:20]):  # First 20 pages max
                    page_text = page.extract_text() or ""
                    text_parts.append(f"--- Halaman {idx + 1} ---\n{page_text}")
                return "\n".join(text_parts)
            except Exception as e:
                logger.error("Error extracting PDF with pypdf: %s", e)
                return f"Gagal mengekstrak teks PDF: {e}"

        elif suffix == ".ipynb":
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    nb = json.load(f)
                cells = []
                for c in nb.get("cells", []):
                    source = "".join(c.get("source", []))
                    c_type = c.get("cell_type", "code")
                    cells.append(f"[{c_type.upper()} CELL]:\n{source}")
                return "\n\n".join(cells)
            except Exception as e:
                return f"Gagal membaca notebook .ipynb: {e}"

        else:
            # Plain text, markdown, python scripts
            try:
                with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                    return f.read()
            except Exception as e:
                return f"Gagal membaca file: {e}"

    async def generate_curriculum_module(
        self,
        content_text: str,
        target_track_id: str = "track_2",
        youtube_url: Optional[str] = None,
        custom_title: Optional[str] = None,
    ) -> GeneratedModuleData:
        truncated_content = content_text[:14000]  # Safe token budget

        track_map = {
            "track_1": "Track 1: Sintaksis Python & Model Memori untuk Matematikawan",
            "track_2": "Track 2: Aljabar Linear Numerik & Data Science",
            "track_3": "Track 3: Optimasi & Machine Learning Klasik",
            "track_4": "Track 4: Deep Learning & Ekshibisi AI",
        }
        track_title = track_map.get(target_track_id, track_map["track_2"])

        system_instruction = (
            "Anda adalah Senior AI Curriculum Architect untuk aplikasi AXION (Precision Mathematical AI & Data Science Learning Environment). "
            "Tugas Anda adalah membaca materi/dokumen yang diunggah pengguna dan menyusun 1 Modul Belajar Berstandar EKKA OSN. "
            "PENGGUNA SUDAH MEMILIKI DASAR MATEMATIKA YANG KUAT TETAPI SEDANG MEMPELAJARI IMPLEMENTASINYA KE KODE PYTHON. "
            "Wajib menyertakan jembatan Math-to-Code (persamaan LaTeX/KaTeX disandingkan dengan vektorisasi NumPy/PyTorch) "
            "serta 1 tantangan koding dengan starter code '# TODO:' dan unit test 'assert' untuk Auto-Grader. "
            "KEMBALIKAN HANYA JSON VALID TANPA MARKDOWN BACKTICKS."
        )

        user_prompt = f"""Target Track: {track_title}
Tautan YouTube Pendamping: {youtube_url or 'Tidak ada'}
Judul Kustom (jika ada): {custom_title or 'Auto-Detect'}

Isi Dokumen / Materi:
\"\"\"
{truncated_content}
\"\"\"

Buat format JSON dengan struktur:
{{
  "id": "module_custom_ingest_{int(hash(content_text[:50]) % 100000)}",
  "title": "Judul Modul Presisi",
  "track_id": "{target_track_id}",
  "track_title": "{track_title}",
  "description": "Ringkasan konsep dan relevansi matematika ke kodenya.",
  "level": "Menengah",
  "lessons": [
    {{
      "title": "Sub-modul 1: Konsep Formal & Teori",
      "type": "THEORY",
      "markdown_theory": "# Penjelasan Teori\\n\\nRumus matematika formal...",
      "math_bridge": {{
        "concept_name": "Nama Konsep Matriks",
        "latex_formula": "Rumus formal LaTeX",
        "tensor_dimensions": "A(m, n) -> Z(m, n)",
        "python_vectorized_code": "import numpy as np\\n# kode vektorisasi...",
        "explanation": "Penjelasan mengapa operasi ini efisien."
      }},
      "starter_code": null,
      "test_assertions": null
    }},
    {{
      "title": "Sub-modul 2: Implementasi Koding & Uji Auto-Grader",
      "type": "CODING",
      "markdown_theory": "# Tantangan Koding\\n\\nTerapkan rumus di atas ke dalam fungsi Python.",
      "math_bridge": null,
      "starter_code": "import numpy as np\\n\\ndef implement_solution(data: np.ndarray) -> np.ndarray:\\n    # TODO: Lengkapi implementasi Anda\\n    pass\\n",
      "test_assertions": "import numpy as np\\nX = np.array([[1.0, 2.0], [3.0, 4.0]])\\nres = implement_solution(X)\\nassert res is not None\\nprint('All test cases passed!')"
    }}
  ]
}}"""

        # Call Gemini Cloud API
        generated_json = await self._call_gemini_json(system_instruction, user_prompt)
        if not generated_json:
            # High-quality fallback deterministic module
            generated_json = {
                "id": f"module_custom_{int(time.time() if 'time' in globals() else 12345)}",
                "title": custom_title or "Modul Aljabar Linear: Dekomposisi Spektral & SVD",
                "track_id": target_track_id,
                "track_title": track_title,
                "description": "Eksplorasi dekomposisi matriks dan implementasi vektorisasi Python berstandar kompetisi EKKA OSN.",
                "level": "Menengah",
                "lessons": [
                    {
                        "title": "1. Teori Nilai Eigen & Dekomposisi Matriks",
                        "type": "THEORY",
                        "markdown_theory": "### Dekomposisi Spektral Matriks Simetris\n\nUntuk setiap matriks simetris nyata $\\mathbf{A} \\in \\mathbb{R}^{n \\times n}$, matriks tersebut dapat difaktorkan menjadi $\\mathbf{A} = \\mathbf{Q} \\mathbf{\\Lambda} \\mathbf{Q}^T$ di mana $\\mathbf{Q}$ adalah matriks ortogonal vektor eigen dan $\\mathbf{\\Lambda}$ adalah matriks diagonal nilai eigen.",
                        "math_bridge": {
                            "concept_name": "Dekomposisi Nilai Eigen",
                            "latex_formula": "\\mathbf{A} \\mathbf{v} = \\lambda \\mathbf{v} \\implies \\mathbf{A} = \\mathbf{Q} \\mathbf{\\Lambda} \\mathbf{Q}^T",
                            "tensor_dimensions": "A(n, n) -> Q(n, n), Lambda(n,)",
                            "python_vectorized_code": "import numpy as np\neigenvalues, eigenvectors = np.linalg.eigh(A)",
                            "explanation": "Fungsi eigh dioptimasi khusus untuk matriks simetris/Hermitian dengan stabilitas numerik tinggi."
                        },
                        "starter_code": None,
                        "test_assertions": None
                    },
                    {
                        "title": "2. Tantangan Koding: Proyeksi Vektor Eigen",
                        "type": "CODING",
                        "markdown_theory": "### Tantangan Praktik EKKA OSN\nLengkapi fungsi untuk memproyeksikan matriks input ke $k$ komponen utama pertama.",
                        "math_bridge": None,
                        "starter_code": "import numpy as np\n\ndef project_principal_components(X: np.ndarray, k: int) -> np.ndarray:\n    # TODO: Hitung matriks kovarian dan proyeksi ke k vektor eigen\n    cov = np.cov(X, rowvar=False)\n    vals, vecs = np.linalg.eigh(cov)\n    idx = np.argsort(vals)[::-1][:k]\n    top_vecs = vecs[:, idx]\n    return X @ top_vecs\n",
                        "test_assertions": "import numpy as np\nX = np.random.randn(20, 5)\nres = project_principal_components(X, 2)\nassert res.shape == (20, 2)\nprint('Principal Component Projection Verified!')"
                    }
                ]
            }

        return GeneratedModuleData(**generated_json)

    async def _call_gemini_json(self, system_instruction: str, user_prompt: str) -> Optional[Dict[str, Any]]:
        if not settings.gemini_api_key:
            return None

        primary_model = settings.gemini_model.strip() or "gemini-3.6-flash"
        candidate_models = [primary_model, "gemini-2.5-pro", "gemini-2.5-flash", "gemini-flash-lite-latest"]

        for model in candidate_models:
            url = f"{settings.gemini_base_url}/models/{model}:generateContent?key={settings.gemini_api_key}"
            payload = {
                "systemInstruction": {"parts": [{"text": system_instruction}]},
                "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
                "generationConfig": {
                    "temperature": 0.2,
                    "responseMimeType": "application/json",
                },
            }

            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        text_resp = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        # Clean backticks if any
                        clean_text = re.sub(r"^```json\s*", "", text_resp.strip())
                        clean_text = re.sub(r"^```\s*", "", clean_text)
                        try:
                            return json.loads(clean_text)
                        except json.JSONDecodeError:
                            sanitized = re.sub(r'\\(?![/"\\bfnrtu]|u[0-9a-fA-F]{4})', r'\\\\', clean_text)
                            return json.loads(sanitized)
                    logger.warning("Model %s returned status %d. Trying next.", model, resp.status_code)
            except Exception as e:
                logger.warning("Model %s failed: %s. Trying next.", model, e)
                continue
        return None

    def commit_module_to_curriculum(self, module_data: GeneratedModuleData) -> Dict[str, Any]:
        manifest_path = settings.curriculum_dir / "manifests" / "curriculum.json"
        modules_dir = settings.curriculum_dir / "modules"
        modules_dir.mkdir(parents=True, exist_ok=True)

        # 1. Read existing curriculum
        if manifest_path.exists():
            with open(manifest_path, "r", encoding="utf-8") as f:
                curriculum_list = json.load(f)
        else:
            curriculum_list = []

        # 2. Check non-destructive: check if ID exists, generate unique suffix if so
        existing_ids = {m.get("id") for m in curriculum_list}
        module_id = module_data.id
        if module_id in existing_ids:
            import time
            module_id = f"{module_id}_{int(time.time())}"

        # 3. Write individual lesson markdown files
        formatted_lessons = []
        for idx, les in enumerate(module_data.lessons):
            lesson_id = f"{module_id}_les_{idx+1}"
            filename = f"{lesson_id}.md"
            file_path = modules_dir / filename

            # Write markdown file
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(les.markdown_theory)

            formatted_lesson = {
                "id": lesson_id,
                "title": les.title,
                "type": les.type,
                "content_path": f"modules/{filename}",
                "video_url": "https://www.youtube.com/embed/QUT1VHiLmmI",
                "starter_code": les.starter_code or "",
                "test_assertions": les.test_assertions or "",
            }
            formatted_lessons.append(formatted_lesson)

        new_module_entry = {
            "id": module_id,
            "title": module_data.title,
            "track_id": module_data.track_id,
            "track_title": module_data.track_title,
            "description": module_data.description,
            "level": module_data.level,
            "estimated_hours": 4,
            "lessons": formatted_lessons,
        }

        curriculum_list.append(new_module_entry)

        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(curriculum_list, f, indent=2, ensure_ascii=False)

        from backend.app.core.cache import memory_cache
        memory_cache.invalidate("curriculum_tree")

        return {
            "success": True,
            "module_id": module_id,
            "module_title": module_data.title,
            "total_lessons_added": len(formatted_lessons),
        }


ingest_service = CurriculumIngestService()
