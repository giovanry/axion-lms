# CS50P Problem Set 1: Deep Thought & File Extensions

Praktikkan penggunaan logika kondisional (`if`, `elif`, `else`) dan pencocokan teks pada Problem Set 1.

---

## Soal 1: Deep Thought (Jawaban atas Segala Hal)
Dalam novel fiksi ilmiah *The Hitchhiker's Guide to the Galaxy*, komputer super bernama Deep Thought membutuhkan waktu 7,5 juta tahun untuk menghitung Jawaban atas Pertanyaan Terbesar mengenai Kehidupan, Semesta, dan Segala Isinya. Jawabannya adalah `42`.

Implementasikan fungsi `is_great_answer(text: str) -> bool`:
- Kembalikan `True` jika input (tanpa memandang huruf besar/kecil atau spasi di tepi) adalah `"42"`, `"forty-two"`, atau `"forty two"`.
- Kembalikan `False` untuk jawaban lainnya.

---

## Soal 2: File Extensions (MIME Type Resolver)
Ketika berkas diunduh melalui internet, browser memeriksa ekstensi berkas untuk menentukan media type (MIME type).
Implementasikan fungsi `get_media_type(filename: str) -> str`:
- `.gif` -> `image/gif`
- `.jpg` atau `.jpeg` -> `image/jpeg`
- `.png` -> `image/png`
- `.pdf` -> `application/pdf`
- `.txt` -> `text/plain`
- `.zip` -> `application/zip`
- Jika berkas tidak memiliki ekstensi di atas, kembalikan `application/octet-stream`.
