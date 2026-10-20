# CS50P Week 3: Exceptions & Error Handling

Ketika kode dijalankan, kesalahan dapat terjadi. Python menyediakan mekanisme penanganan eksepsi (*exception handling*) untuk mencegah program mengalami crash mendadak saat menghadapi input tak terduga.

---

## 1. Blok `try` dan `except`

Blok `try` digunakan untuk membungkus kode yang berpotensi menghasilkan galat (*error*), dan blok `except` menangkap jenis kesalahan tertentu:

```python
try:
    x = int(input("Masukkan bilangan bulat: "))
except ValueError:
    print("Nilai yang dimasukkan bukan bilangan bulat!")
```

---

## 2. Blok `else` dan `finally`

- `else`: Dijalankan hanya jika blok `try` berhasil dieksekusi tanpa memicu eksepsi apa pun.
- `finally`: Selalu dieksekusi terlepas dari apakah terjadi eksepsi atau tidak (biasanya untuk menutup file atau koneksi jaringan).

```python
while True:
    try:
        x = int(input("Nilai integer: "))
    except ValueError:
        print("Input salah. Coba lagi.")
    else:
        break

print(f"Bilangan yang dimasukkan: {x}")
```

---

## 3. Memicu Eksepsi Sendiri (`raise`)

Kita dapat sengaja memicu kesalahan jika aturan logika bisnis dilanggar:

```python
def set_age(age: int):
    if age < 0:
        raise ValueError("Umur tidak boleh bernilai negatif")
    return age
```
