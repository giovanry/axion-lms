# CS50P Week 2: Loops & Data Sequences

Perulangan (*loops*) adalah mekanisme fundamental untuk mengulang eksekusi kode beberapa kali tanpa menuliskan instruksi yang sama berulang-ulang.

---

## 1. Perulangan `while`

Perulangan `while` terus berjalan selama kondisi yang ditentukan bernilai `True`:

```python
i = 0
while i < 3:
    print("meow")
    i += 1
```

---

## 2. Perulangan `for` & Objek `range`

`for` digunakan untuk mengiterasi urutan elemen atau angka menggunakan fungsi pembantu `range(start, stop, step)`:

```python
for _ in range(3):
    print("meow")
```

---

## 3. List & Dictionary

- **List (`list`)**: Urutan terindeks dari elemen-elemen data (`[elemen1, elemen2, ...]`).
- **Dictionary (`dict`)**: Kumpulan pasangan kunci-nilai (*key-value pairs*):

```python
students = [
    {"name": "Hermione", "house": "Gryffindor", "patronus": "Otter"},
    {"name": "Harry", "house": "Gryffindor", "patronus": "Stag"},
    {"name": "Ron", "house": "Gryffindor", "patronus": "Jack Russell Terrier"},
    {"name": "Draco", "house": "Slytherin", "patronus": None},
]

for student in students:
    print(student["name"], student["house"], student["patronus"], sep=", ")
```

---

## 4. Kontrol Perulangan: `break` & `continue`

- `break`: Menghentikan seluruh perulangan seketika.
- `continue`: Melewati iterasi saat ini dan langsung melompat ke iterasi berikutnya.
