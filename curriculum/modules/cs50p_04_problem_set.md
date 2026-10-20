# CS50P Problem Set 4: Bitcoin Index & Little Professor

Praktikkan penggunaan modul standar Python dan pemrosesan data struktur kamus/JSON.

---

## Soal 1: Bitcoin Price Index Calculator
Katakanlah Anda memiliki $N$ keping Bitcoin dan ingin mengonversinya ke mata uang Dolar AS (USD) berdasarkan nilai tukar pasar terkini.

Implementasikan fungsi `calculate_bitcoin_value(n_bitcoins: float, price_usd: float) -> str`:
- Menghitung total nilai: $\text{total} = n \times \text{price}$.
- Mengembalikan nilai yang diformat dengan tanda pemisah ribuan dan 4 digit desimal diawali simbol dolar: `f"${total:,.4f}"`.
- Contoh: untuk `2.5` BTC seharga `$38,765.1225`, hasilnya adalah `"$96,912.8063"`.

---

## Soal 2: Little Professor Math Game
Little Professor adalah mainan kalkulator elektronik retro dari era 1970-an yang memberikan soal matematika sederhana dan meminta pengguna menjawabnya.
Implementasikan fungsi `evaluate_math_answer(x: int, y: int, op: str, user_ans: int) -> bool`:
- Mendukung operator `"+"` dan `"-"`.
- Mengembalikan `True` jika jawaban pengguna tepat sesuai hasil operasi aritmatika, atau `False` jika salah.
