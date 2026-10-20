# CS50P Week 7: Regular Expressions (RegEx)

*Regular Expressions* (pola ekspresi reguler) adalah pola pencocokan string yang sangat kuat untuk memvalidasi format input (seperti email, alamat IP, URL) dan mengekstrak substring spesifik.

---

## 1. Simbol Pola Dasar RegEx

- `^`: Cocok dengan awal string.
- `$`: Cocok dengan akhir string.
- `.`: Sembarang karakter kecuali baris baru.
- `*`: 0 atau lebih pengulangan.
- `+`: 1 atau lebih pengulangan.
- `?`: 0 atau 1 pengulangan (opsional).
- `\d`: Sembarang digit desimal `[0-9]`.
- `\w`: Karakter kata `[a-zA-Z0-9_]`.
- `\s`: Spasi putih (*whitespace*).

---

## 2. Modul `re` di Python

```python
import re

email = input("Masukkan alamat email: ").strip()

# Validasi format email dasar: user@domain.com
if re.search(r"^[^@]+@[^@]+\.[a-z]+$", email, re.IGNORECASE):
    print("Valid")
else:
    print("Tidak Valid")
```

---

## 3. Ekstraksi Data dengan Grup `(...)`

Tanda kurung `()` mendefinisikan grup tangkapan (*capture group*):

```python
import re

url = "https://www.youtube.com/watch?v=JP7ITIXGpHk"
if matches := re.search(r"^https?://(?:www\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]+)", url):
    video_id = matches.group(1)
    print("ID Video:", video_id)
```
