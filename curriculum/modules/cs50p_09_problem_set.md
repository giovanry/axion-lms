# CS50P Problem Set 9: Unpacking & Generator Pipeline

Praktikkan konsep pemrosesan data lanjutan, unpacking, dan generator.

---

## Soal 1: Filter & Square Even Numbers
Implementasikan fungsi `square_evens(numbers: list[int]) -> list[int]`:
- Menggunakan *list comprehension* untuk menyaring hanya bilangan genap, lalu menguadratkannya.
- Contoh: `[1, 2, 3, 4, 5, 6]` -> `[4, 16, 36]`.

---

## Soal 2: Fibonacci Generator
Implementasikan generator `fibonacci(n: int)`:
- Menghasilkan $n$ bilangan pertama dari deret Fibonacci ($0, 1, 1, 2, 3, 5, 8, \dots$).
- Harus menggunakan kata kunci `yield`.
