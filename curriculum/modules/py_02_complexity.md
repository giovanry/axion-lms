# Analisis Kompleksitas Algoritma & Struktur Data

## Notasi Asimtotik (Big-O)

Notasi Big-O mengkarakterisasi batas atas pertumbuhan waktu eksekusi atau penggunaan memori terhadap ukuran input $N$:

$$f(N) \in O(g(N)) \iff \exists c > 0, N_0 > 0 \text{ s.t. } \forall N \ge N_0, |f(N)| \le c \cdot |g(N)|$$

### Hirarki Kompleksitas Waktu

1. **$O(1)$ Konstan:** Hash table lookup, indeks array langsung.
2. **$O(\log N)$ Logaritmik:** Binary Search pada array terurut.
3. **$O(N)$ Linear:** Linear scan, iterasi satu dimensi.
4. **$O(N \log N)$ Linearitmik:** Merge Sort, Timsort bawaan Python.
5. **$O(N^2)$ Kuadratik:** Nested loop pada matriks.
