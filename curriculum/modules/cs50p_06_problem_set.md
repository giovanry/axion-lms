# CS50P Problem Set 6: Lines of Code & Scourgify Data Cleaner

Praktikkan manipulasi berkas teks dan struktur data CSV pada Problem Set 6.

---

## Soal 1: Lines of Code Counter
Berapa baris kode aktual yang ada dalam program Python Anda? Seringkali kita ingin mengabaikan baris kosong (*blank lines*) dan baris komentar yang diawali tanda pagar `#`.

Implementasikan fungsi `count_code_lines(source_code: str) -> int`:
- Mengabaikan baris yang hanya berisi spasi/kosong.
- Mengabaikan baris yang diawali dengan komentar `#` (setelah whitespace di-strip).
- Menghitung seluruh baris kode aktual lainnya.

---

## Soal 2: Scourgify Name Splitter
Diberikan daftar nama siswa dalam format `"Lastname, Firstname"` dalam catatan CSV.
Implementasikan fungsi `split_full_name(raw_name: str) -> tuple[str, str]`:
- Menguraikan `"Potter, Harry"` menjadi `("Harry", "Potter")`.
- Memastikan whitespace di awal dan akhir nama depan maupun nama belakang dibersihkan secara rapi.
