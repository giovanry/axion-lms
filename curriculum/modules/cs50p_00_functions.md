# CS50P Week 0: Functions & Variables

Selamat datang di **CS50's Introduction to Programming with Python** dari Universitas Harvard bersama Prof. David J. Malan. Pada minggu pertama ini, kita mempelajari bagaimana komputer mengeksekusi instruksi dari atas ke bawah, bagaimana fungsi menerima argumen dan menghasilkan nilai, serta bagaimana data disimpan dalam memori menggunakan variabel.

---

## 1. Fungsi & Argumen

Fungsi (*function*) adalah blok kode terisolasi yang melakukan tugas spesifik. Dalam Python, kita menggunakan fungsi bawaan (*built-in function*) seperti `print()` dan `input()`:

```python
# Meminta input nama dari pengguna
name = input("What's your name? ")

# Menampilkan ucapan selamat datang
print("Hello,", name)
```

### Argumen Bernama (Named Arguments)
Fungsi `print()` memiliki parameter opsional seperti `sep` (separator) dan `end` (karakter penutup):
```python
print("Hello", name, sep=" --- ")
print("Hello, ", end="")
print(name)
```

---

## 2. Manipulasi String (`str`)

Tipe data teks di Python adalah `str`. Kita dapat memodifikasi string menggunakan *methods*:
- `.strip()`: Menghapus spasi putih (*whitespace*) di awal dan akhir teks.
- `.capitalize()`: Mengubah huruf pertama menjadi kapital.
- `.title()`: Mengubah setiap awal kata menjadi huruf kapital.

```python
name = input("What's your name? ").strip().title()
print(f"Hello, {name}!")
```

> [!TIP]
> **f-string (Format String)**: Ditulis dengan awalan `f"..."`, memungkinkan kita menyisipkan variabel atau ekspresi Python langsung di dalam tanda kurung kurawal `{variabel}`.

---

## 3. Tipe Data Numerik & Operator

- **Integer (`int`)**: Bilangan bulat (misal: `-5`, `0`, `42`).
- **Float (`float`)**: Bilangan desimal (misal: `3.14`, `0.001`).

```python
x = float(input("Nilai x: "))
y = float(input("Nilai y: "))

# Penjumlahan dan pembulatan 2 digit desimal
z = round(x + y, 2)
print(f"Hasil: {z:,}")  # Format ribuan dengan koma
```

---

## 4. Mendefinisikan Fungsi Sendiri (`def`)

Gunakan kata kunci `def` untuk membuat fungsi modular:

```python
def main():
    name = input("What's your name? ")
    hello(name)

def hello(to="world"):
    print(f"Hello, {to}!")

if __name__ == "__main__":
    main()
```
