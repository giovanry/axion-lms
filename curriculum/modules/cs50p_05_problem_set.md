# CS50P Problem Set 5: Unit Testing twttr & Vanity Plates

Pada problem set ini, Anda akan menulis kumpulan fungsi pengujian (*unit tests*) untuk memastikan fungsi logika bisnis bebas dari bug dan regresi.

---

## Spesifikasi Tugas
Diberikan fungsi `shorten(word: str) -> str` dari Week 2. Buat kumpulan test assertions untuk menguji skenario batas (*edge cases*):
1. Kata tanpa huruf vokal (misal `"CS50"` -> `"CS50"`).
2. Kata dengan huruf vokal kecil (misal `"twitter"` -> `"twttr"`).
3. Kata dengan huruf vokal kapital (misal `"PYTHON"` -> `"PYTHN"`).
4. Kalimat dengan tanda baca dan angka (misal `"What's 123?"` -> `"Wht's 123?"`).

Tuliskan fungsi pengujian `run_twttr_tests(shorten_func)` yang memverifikasi seluruh skenario di atas menggunakan pernyataan `assert`.
