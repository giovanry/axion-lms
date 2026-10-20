import json
import re
from typing import Any, Dict, List, Optional
from bs4 import BeautifulSoup
import httpx
from sqlmodel import Session, select
from backend.app.core.config import settings
from backend.app.core.database import engine
from backend.app.models.schema import CodeforcesProblem
from backend.app.services.ai_service import translate_problem_to_indonesian

# Pre-seeded verified classic Codeforces problems with Indonesian translations and sample cases
SEED_PROBLEMS = [
    {
        "id": "4A",
        "contest_id": 4,
        "index": "A",
        "title": "Watermelon",
        "time_limit_ms": 1000,
        "memory_limit_mb": 64,
        "statement_en": (
            "One hot summer day Pete and his friend Billy decided to buy a watermelon. "
            "They chose the biggest and the ripest one, in their opinion. After that the watermelon "
            "was weighed, and the scales showed w kilos. They rushed home dying of thirst, and decided "
            "to divide the berry, however they faced a hard problem.\n\n"
            "Pete and Billy are great fans of even numbers, that's why they want to divide the watermelon "
            "in such a way that each of the two parts weighs even number of kilos, at the same time it is not "
            "obligatory that the parts are equal. The boys are extremely tired and want to start their meal as "
            "soon as possible, that's why you should help them and find out, if they can divide the watermelon "
            "the way they want. For sure, each of them should get a part of positive weight."
        ),
        "statement_id": (
            "Pada suatu hari di musim panas, Pete dan temannya Billy memutuskan untuk membeli sebuah semangka. "
            "Mereka memilih semangka yang paling besar dan matang. Setelah ditimbang, timbangan menunjukkan berat w kilogram. "
            "Mereka bergegas pulang karena kehausan dan memutuskan untuk membagi semangka tersebut, namun mereka menghadapi masalah.\n\n"
            "Pete dan Billy sangat menyukai bilangan genap. Oleh karena itu, mereka ingin membagi semangka tersebut sedemikian rupa "
            "sehingga kedua bagian masing-masing memiliki berat bilangan genap (positif), tidak harus sama besar. "
            "Bantulah mereka menentukan apakah semangka tersebut dapat dibagi sesuai keinginan mereka."
        ),
        "input_specification_en": "The first (and the only) input line contains integer number w (1 <= w <= 100) — the weight of the watermelon bought by the boys.",
        "input_specification_id": "Baris pertama berisi satu bilangan bulat w (1 <= w <= 100), berat semangka dalam kilogram.",
        "output_specification_en": "Print YES, if the boys can divide the watermelon into two parts, each of them weighing even number of kilos; and NO in the opposite case.",
        "output_specification_id": "Cetak YES jika semangka dapat dibagi menjadi dua bagian dengan berat bilangan genap positif, atau NO jika tidak bisa.",
        "sample_cases": [
            {"input": "8\n", "output": "YES\n"},
            {"input": "2\n", "output": "NO\n"},
        ],
    },
    {
        "id": "71A",
        "contest_id": 71,
        "index": "A",
        "title": "Way Too Long Words",
        "time_limit_ms": 1000,
        "memory_limit_mb": 256,
        "statement_en": (
            "Sometimes some words like 'localization' or 'internationalization' are so long that writing them many times "
            "in one text is quite tiresome.\n\n"
            "Let's consider a word too long, if its length is strictly more than 10 characters. All too long words should be "
            "replaced with a special abbreviation.\n\n"
            "This abbreviation is made like this: we write down the first and the last letter of a word and between them we write "
            "the number of letters between the first and the last letters. That number is in decimal system and doesn't contain any leading zeroes.\n\n"
            "Thus, 'localization' will be spelt as 'l10n', and 'internationalization' will be spelt as 'i18n'."
        ),
        "statement_id": (
            "Terkadang kata-kata seperti 'localization' atau 'internationalization' sangat panjang sehingga melelahkan untuk ditulis berulang kali.\n\n"
            "Sebuah kata dianggap terlalu panjang jika panjangnya lebih dari 10 karakter. Setiap kata yang terlalu panjang harus diganti "
            "dengan singkatan khusus.\n\n"
            "Singkatan ini dibentuk dengan: menulis huruf pertama dan huruf terakhir kata tersebut, dan di antara keduanya dituliskan "
            "jumlah huruf yang berada di antara huruf pertama dan terakhir dalam basis 10 tanpa awalan nol.\n\n"
            "Sebagai contoh, 'localization' menjadi 'l10n', dan 'internationalization' menjadi 'i18n'."
        ),
        "input_specification_en": "The first line contains an integer n (1 <= n <= 100). Each of the following n lines contains one word.",
        "input_specification_id": "Baris pertama berisi sebuah bilangan bulat n (1 <= n <= 100). n baris berikutnya masing-masing berisi satu kata.",
        "output_specification_en": "Print n lines. The i-th line should contain the result of replacing of the i-th word from the input data.",
        "output_specification_id": "Cetak n baris berisi hasil singkatan untuk masing-masing kata masukan.",
        "sample_cases": [
            {
                "input": "4\nword\nlocalization\ninternationalization\npneumonoultramicroscopicsilicovolcanoconiosis\n",
                "output": "word\nl10n\ni18n\np43s\n",
            }
        ],
    },
    {
        "id": "158A",
        "contest_id": 158,
        "index": "A",
        "title": "Next Round",
        "time_limit_ms": 3000,
        "memory_limit_mb": 256,
        "statement_en": (
            "Contestant who earns a score equal to or greater than the k-th place finisher's score will advance to the next round, "
            "as long as the contestant earns a positive score. Calculate the total number of contestants who will advance to the next round."
        ),
        "statement_id": (
            "Peserta yang memperoleh nilai sama dengan atau lebih besar dari nilai peraih peringkat ke-k akan lolos ke babak berikutnya, "
            "dengan syarat peserta tersebut memperoleh nilai positif (> 0). Hitung berapa banyak peserta yang lolos ke babak berikutnya."
        ),
        "input_specification_en": "The first line contains two integers n and k (1 <= k <= n <= 50). The second line contains n space-separated integers a1, a2, ..., an (0 <= ai <= 100).",
        "input_specification_id": "Baris pertama berisi dua bilangan bulat n dan k (1 <= k <= n <= 50). Baris kedua berisi n bilangan bulat dipisahkan spasi a1, a2, ..., an (0 <= ai <= 100) dalam urutan tidak naik.",
        "output_specification_en": "Output the number of participants who advance to the next round.",
        "output_specification_id": "Keluarkan jumlah peserta yang lolos ke babak berikutnya.",
        "sample_cases": [
            {
                "input": "8 5\n10 9 8 7 7 7 5 5\n",
                "output": "6\n",
            },
            {
                "input": "4 2\n0 0 0 0\n",
                "output": "0\n",
            },
        ],
    },
]


def seed_initial_problems() -> None:
    with Session(engine) as session:
        for p in SEED_PROBLEMS:
            existing = session.exec(select(CodeforcesProblem).where(CodeforcesProblem.id == p["id"])).first()
            if not existing:
                problem = CodeforcesProblem(
                    id=p["id"],
                    contest_id=p["contest_id"],
                    index=p["index"],
                    title=p["title"],
                    time_limit_ms=p["time_limit_ms"],
                    memory_limit_mb=p["memory_limit_mb"],
                    statement_en=p["statement_en"],
                    statement_id=p["statement_id"],
                    input_specification_en=p["input_specification_en"],
                    output_specification_en=p["output_specification_en"],
                    input_specification_id=p["input_specification_id"],
                    output_specification_id=p["output_specification_id"],
                    sample_cases_json=json.dumps(p["sample_cases"]),
                )
                session.add(problem)
        session.commit()


def parse_problem_id(raw_id: str) -> tuple[Optional[int], Optional[str]]:
    match = re.match(r"^(\d+)([A-Za-z]\d?)$", raw_id.strip())
    if match:
        return int(match.group(1)), match.group(2).upper()
    return None, None


_IN_MEMORY_PROBLEM_CACHE: Dict[str, Dict[str, Any]] = {}
_CF_PROBLEMS_CACHE: List[Dict[str, Any]] = []


async def load_or_fetch_problemset_list() -> List[Dict[str, Any]]:
    global _CF_PROBLEMS_CACHE
    if _CF_PROBLEMS_CACHE:
        return _CF_PROBLEMS_CACHE

    cache_file = settings.cache_dir / "cf_problemset.json"
    if cache_file.exists():
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                _CF_PROBLEMS_CACHE = json.load(f)
                if _CF_PROBLEMS_CACHE:
                    return _CF_PROBLEMS_CACHE
        except Exception:
            pass

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get("https://codeforces.com/api/problemset.problems")
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "OK":
                    raw_probs = data.get("result", {}).get("problems", [])
                    cleaned: List[Dict[str, Any]] = []
                    for p in raw_probs:
                        c_id = p.get("contestId")
                        idx = p.get("index")
                        if c_id and idx:
                            cleaned.append({
                                "id": f"{c_id}{idx}".upper(),
                                "contest_id": c_id,
                                "index": idx,
                                "name": p.get("name", f"Problem {c_id}{idx}"),
                                "rating": p.get("rating"),
                                "tags": p.get("tags", []),
                            })
                    if cleaned:
                        _CF_PROBLEMS_CACHE = cleaned
                        settings.cache_dir.mkdir(parents=True, exist_ok=True)
                        with open(cache_file, "w", encoding="utf-8") as f:
                            json.dump(cleaned, f)
                        return cleaned
    except Exception:
        pass

    return _CF_PROBLEMS_CACHE


async def query_problemset(
    search: Optional[str] = None,
    rating: Optional[int] = None,
    tag: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> Dict[str, Any]:
    all_probs = await load_or_fetch_problemset_list()
    filtered = all_probs
    if search:
        s = search.strip().lower()
        filtered = [
            p for p in filtered
            if s in p["id"].lower() or s in p["name"].lower()
        ]
    if rating:
        filtered = [p for p in filtered if p.get("rating") == rating]
    if tag:
        t = tag.strip().lower()
        filtered = [p for p in filtered if any(t in str(tg).lower() for tg in p.get("tags", []))]

    total = len(filtered)
    page_items = filtered[offset : offset + limit]
    return {
        "total": total,
        "problems": page_items,
    }


async def fetch_or_get_problem(problem_id: str) -> Optional[Dict[str, Any]]:
    clean_id = problem_id.strip().upper()

    if clean_id in _IN_MEMORY_PROBLEM_CACHE:
        return _IN_MEMORY_PROBLEM_CACHE[clean_id]

    with Session(engine) as session:
        prob = session.exec(select(CodeforcesProblem).where(CodeforcesProblem.id == clean_id)).first()
        if prob:
            data = {
                "id": prob.id,
                "contest_id": prob.contest_id,
                "index": prob.index,
                "title": prob.title,
                "time_limit_ms": prob.time_limit_ms,
                "memory_limit_mb": prob.memory_limit_mb,
                "statement_en": prob.statement_en,
                "statement_id": prob.statement_id,
                "input_specification_en": prob.input_specification_en,
                "output_specification_en": prob.output_specification_en,
                "input_specification_id": prob.input_specification_id,
                "output_specification_id": prob.output_specification_id,
                "sample_cases": json.loads(prob.sample_cases_json),
            }
            _IN_MEMORY_PROBLEM_CACHE[clean_id] = data
            return data

    contest_id, index = parse_problem_id(clean_id)
    if not contest_id or not index:
        return None

    # Step 1: Try scraping problem HTML statement
    cf_url = f"https://codeforces.com/contest/{contest_id}/problem/{index}"
    try:
        async with httpx.AsyncClient(timeout=6.0, follow_redirects=True) as client:
            resp = await client.get(cf_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                problem_stmt = soup.find("div", class_="problem-statement")
                if problem_stmt:
                    title_elem = problem_stmt.find("div", class_="title")
                    title = title_elem.text.strip() if title_elem else f"Problem {clean_id}"
                    
                    header_div = problem_stmt.find("div", class_="header")
                    if header_div:
                        header_div.decompose()
                        
                    samples: List[Dict[str, str]] = []
                    sample_tests = problem_stmt.find("div", class_="sample-test")
                    if sample_tests:
                        inputs = sample_tests.find_all("div", class_="input")
                        outputs = sample_tests.find_all("div", class_="output")
                        for inp, out in zip(inputs, outputs):
                            inp_pre = inp.find("pre")
                            out_pre = out.find("pre")
                            if inp_pre and out_pre:
                                inp_text = "\n".join([line.strip() for line in inp_pre.stripped_strings if line.strip() != "Input"])
                                out_text = "\n".join([line.strip() for line in out_pre.stripped_strings if line.strip() != "Output"])
                                samples.append({"input": inp_text + "\n", "output": out_text + "\n"})

                    full_text = problem_stmt.get_text("\n\n").strip()

                    with Session(engine) as session:
                        new_prob = CodeforcesProblem(
                            id=clean_id,
                            contest_id=contest_id,
                            index=index,
                            title=title,
                            statement_en=full_text,
                            statement_id=None,
                            input_specification_en="Refer to statement.",
                            output_specification_en="Refer to statement.",
                            sample_cases_json=json.dumps(samples),
                        )
                        session.add(new_prob)
                        session.commit()
                        
                    result_data = {
                        "id": clean_id,
                        "contest_id": contest_id,
                        "index": index,
                        "title": title,
                        "time_limit_ms": 1000,
                        "memory_limit_mb": 256,
                        "statement_en": full_text,
                        "statement_id": None,
                        "input_specification_en": "Refer to statement.",
                        "output_specification_en": "Refer to statement.",
                        "sample_cases": samples,
                    }
                    _IN_MEMORY_PROBLEM_CACHE[clean_id] = result_data
                    return result_data
    except Exception:
        pass

    # Step 2: Fallback to official Codeforces API catalogue if Cloudflare blocks HTML scraping
    probs_list = await load_or_fetch_problemset_list()
    matched = next((p for p in probs_list if p["id"] == clean_id), None)
    if matched:
        p_name = matched.get("name", f"Problem {clean_id}")
        p_rating = matched.get("rating")
        rating_str = f"Rating: {p_rating}" if p_rating else "Unrated"
        tags_str = ", ".join(matched.get("tags", [])) or "competitive programming"
        
        statement_en = (
            f"Codeforces Contest {contest_id} Problem {index}: {p_name}\n\n"
            f"Difficulty: {rating_str} | Tags: {tags_str}\n\n"
            f"Note: Due to Cloudflare anti-bot protection on Codeforces website, please read the complete problem statement and mathematical notation on the official page:\n"
            f"https://codeforces.com/contest/{contest_id}/problem/{index}\n\n"
            f"Write your solution in the code editor on the right and test with sample inputs/outputs."
        )
        statement_id = (
            f"Soal Codeforces Kontes {contest_id} Indeks {index}: {p_name}\n\n"
            f"Tingkat Kesulitan: {rating_str} | Tag Topik: {tags_str}\n\n"
            f"Catatan: Anda dapat membaca deskripsi lengkap dan notasi matematika pada tautan resmi Codeforces:\n"
            f"https://codeforces.com/contest/{contest_id}/problem/{index}\n\n"
            f"Tulis kode solusi Anda di editor sebelah kanan dan uji dengan contoh kasus masukan/keluaran."
        )
        default_samples = [
            {"input": "1\n", "output": "1\n"}
        ]
        with Session(engine) as session:
            new_prob = CodeforcesProblem(
                id=clean_id,
                contest_id=contest_id,
                index=index,
                title=p_name,
                statement_en=statement_en,
                statement_id=statement_id,
                input_specification_en="Lihat deskripsi di tautan resmi Codeforces.",
                output_specification_en="Keluarkan jawaban sesuai spesifikasi soal.",
                input_specification_id="Lihat deskripsi di tautan resmi Codeforces.",
                output_specification_id="Keluarkan jawaban sesuai spesifikasi soal.",
                sample_cases_json=json.dumps(default_samples),
            )
            session.add(new_prob)
            session.commit()

        api_data = {
            "id": clean_id,
            "contest_id": contest_id,
            "index": index,
            "title": p_name,
            "time_limit_ms": 1000,
            "memory_limit_mb": 256,
            "statement_en": statement_en,
            "statement_id": statement_id,
            "input_specification_en": "Lihat deskripsi di tautan resmi Codeforces.",
            "output_specification_en": "Keluarkan jawaban sesuai spesifikasi soal.",
            "input_specification_id": "Lihat deskripsi di tautan resmi Codeforces.",
            "output_specification_id": "Keluarkan jawaban sesuai spesifikasi soal.",
            "sample_cases": default_samples,
        }
        _IN_MEMORY_PROBLEM_CACHE[clean_id] = api_data
        return api_data

    return None


async def translate_and_cache_problem(problem_id: str) -> Optional[Dict[str, Any]]:
    clean_id = problem_id.strip().upper()
    with Session(engine) as session:
        prob = session.exec(select(CodeforcesProblem).where(CodeforcesProblem.id == clean_id)).first()
        if not prob:
            return None
        if prob.statement_id and not prob.statement_id.startswith("[Terjemahan otomatis belum tersedia"):
            return {
                "id": prob.id,
                "title_id": prob.title,
                "statement_id": prob.statement_id,
                "input_specification_id": prob.input_specification_id,
                "output_specification_id": prob.output_specification_id,
            }

        translation = await translate_problem_to_indonesian(
            title=prob.title,
            statement_en=prob.statement_en,
            input_spec_en=prob.input_specification_en or "",
            output_spec_en=prob.output_specification_en or "",
        )

        prob.statement_id = translation["statement_id"]
        prob.input_specification_id = translation["input_specification_id"]
        prob.output_specification_id = translation["output_specification_id"]
        session.add(prob)
        session.commit()

        return {
            "id": prob.id,
            "title_id": translation.get("title_id", prob.title),
            "statement_id": prob.statement_id,
            "input_specification_id": prob.input_specification_id,
            "output_specification_id": prob.output_specification_id,
        }
