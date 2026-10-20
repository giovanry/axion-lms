# CS50P Problem Set 7: NUMB3RS (IPv4 Validator) & YouTube Link Extractor

Praktikkan penggunaan modul `re` untuk memvalidasi dan mengekstrak data string.

---

## Soal 1: NUMB3RS (Validasi Alamat IPv4)
Alamat IPv4 (Internet Protocol versi 4) adalah alamat numerik berformat `##.#.#.#`, di mana setiap angka berkisar antara `0` hingga `255` inklusif (dipisahkan oleh tanda titik).

Implementasikan fungsi `validate_ipv4(ip: str) -> bool`:
- Kembalikan `True` jika string adalah alamat IPv4 yang valid (misal `"127.0.0.1"`, `"255.255.255.0"`, `"8.8.8.8"`).
- Kembalikan `False` jika format salah, ada nilai di luar rentang $0-255$ (misal `"275.3.6.28"`), atau terdapat huruf.

---

## Soal 2: YouTube Video ID Extractor
Implementasikan fungsi `extract_youtube_id(url: str) -> str | None`:
- Menerima URL YouTube berformat `https://www.youtube.com/watch?v=VIDEO_ID` atau `https://youtu.be/VIDEO_ID`.
- Mengembalikan ID video (misal `"JP7ITIXGpHk"`).
- Mengembalikan `None` jika bukan format URL YouTube yang sah.
