# CS50P Problem Set 2: camelCase Converter & Twttr Vowel Stripper

Pada problem set ini, Anda akan menerapkan perulangan `for` dan manipulasi karakter string untuk memproses teks.

---

## Soal 1: camelCase ke snake_case
Dalam bahasa pemrograman seperti Java atau JavaScript, nama variabel sering ditulis dengan format **camelCase** (misal: `firstName`, `totalItemCount`). Namun, dalam konvensi Python PEP 8, nama variabel ditulis dalam format **snake_case** (huruf kecil semua dipisahkan garis bawah, misal: `first_name`, `total_item_count`).

Implementasikan fungsi `camel_to_snake(camel: str) -> str`:
- Setiap kali menemukan huruf besar, ubah menjadi garis bawah (`_`) diikuti huruf kecil yang bersangkutan.

---

## Soal 2: Just setting up my twttr
Ketika Twitter (sekarang X) pertama kali didirikan pada tahun 2006 oleh Jack Dorsey, nama aslinya dieja tanpa huruf vokal: **twttr**.

Implementasikan fungsi `shorten(word: str) -> str`:
- Hapus semua huruf vokal (`A`, `E`, `I`, `O`, `U`, baik huruf besar maupun huruf kecil) dari teks masukan dan kembalikan string hasilnya.
