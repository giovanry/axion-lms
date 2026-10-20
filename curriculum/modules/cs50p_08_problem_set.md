# CS50P Problem Set 8: Cookie Jar (Toples Kue)

Problem Set 8 mengajak Anda membuat kelas Python dengan enkapsulasi data dan validasi atribut.

---

## Spesifikasi Kelas `Jar`
Implementasikan kelas `Jar` yang merepresentasikan toples kue:
1. `__init__(self, capacity=12)`:
   - Menginisialisasi toples dengan kapasitas maksimum `capacity` (integer non-negatif).
   - Melempar `ValueError` jika `capacity` bukan integer non-negatif.
   - Kapasitas awal kue di dalam toples adalah `0`.
2. `deposit(self, n: int)`:
   - Menambahkan `n` buah kue ke dalam toples.
   - Melempar `ValueError` jika penambahan melebihi kapasitas toples.
3. `withdraw(self, n: int)`:
   - Mengambil `n` buah kue dari toples.
   - Melempar `ValueError` jika kue yang diambil lebih banyak daripada kue yang ada di toples.
4. `__str__(self) -> str`:
   - Mengembalikan string yang berisi karakter emoji kue `🍪` sebanyak jumlah kue di toples.
5. `@property capacity`: Mengembalikan kapasitas maksimum toples.
6. `@property size`: Mengembalikan jumlah kue yang saat ini ada di toples.
