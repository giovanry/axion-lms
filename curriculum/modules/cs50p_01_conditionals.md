# CS50P Week 1: Conditionals & Boolean Logic

Dalam pemrograman, *conditionals* (kondisional) memungkinkan program mengambil keputusan dan mengeksekusi alur logika yang berbeda berdasarkan evaluasi kondisi benar (*True*) atau salah (*False*).

---

## 1. Pernyataan `if`, `elif`, dan `else`

Sintaks percabangan di Python menggunakan indentasi 4 spasi:

```python
x = int(input("Nilai x: "))
y = int(input("Nilai y: "))

if x < y:
    print("x lebih kecil dari y")
elif x > y:
    print("x lebih besar dari y")
else:
    print("x sama dengan y")
```

---

## 2. Operator Logika: `or`, `and`, dan `not`

- `or`: Bernilai True jika minimal salah satu kondisi bernilai True.
- `and`: Bernilai True jika kedua kondisi harus bernilai True.
- `not`: Membalik nilai kebenaran suatu ekspresi.

```python
score = int(input("Nilai skor ujian: "))

if score >= 90 and score <= 100:
    print("Predikat: A")
elif score >= 80:
    print("Predikat: B")
elif score >= 70:
    print("Predikat: C")
else:
    print("Predikat: Remedial")
```

---

## 3. Operator Modulo (`%`) & Paritas Bilangan

Operator `%` menghasilkan sisa hasil pembagian (*remainder*). Dapat digunakan untuk menentukan apakah sebuah bilangan genap atau ganjil:

```python
def is_even(n: int) -> bool:
    return n % 2 == 0
```

---

## 4. Pencocokan Pola Struktural: `match`

Python 3.10+ memperkenalkan pernyataan `match` (mirip `switch-case` di bahasa lain):

```python
name = input("Nama karakter Harry Potter: ")

match name:
    case "Harry" | "Hermione" | "Ron":
        print("Gryffindor")
    case "Draco":
        print("Slytherin")
    case _:
        print("Asrama tidak dikenal")
```
