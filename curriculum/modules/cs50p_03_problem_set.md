# CS50P Problem Set 3: Fuel Gauge (Pengukur Bahan Bakar)

Pada kendaraan bermotor, pengukur tangki bahan bakar biasanya menampilkan persentase bahan bakar yang tersisa sebagai pecahan atau huruf:
- Tangki penuh: **F** (Full) jika $\ge 99\%$.
- Tangki kosong: **E** (Empty) jika $\le 1\%$.
- Di antara rentang tersebut: persentase bilangan bulat diikuti `%` (misal `75%`).

---

## Spesifikasi Tugas
Implementasikan fungsi:
1. `convert(fraction_str: str) -> int`:
   - Menerima string berformat `"X/Y"`, di mana `X` dan `Y` adalah integer positif.
   - Mengembalikan persentase hasil pembagian $\frac{X}{Y} \times 100$ yang dibulatkan ke integer terdekat.
   - Melempar `ZeroDivisionError` jika penyebut $Y = 0$.
   - Melempar `ValueError` jika $X > Y$ atau jika format pecahan tidak valid.
2. `gauge(percentage: int) -> str`:
   - Jika `percentage <= 1`: kembalikan `"E"`.
   - Jika `percentage >= 99`: kembalikan `"F"`.
   - Jika lainnya: kembalikan `f"{percentage}%"`.
