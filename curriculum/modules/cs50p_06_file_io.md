# CS50P Week 6: File I/O (Input & Output Berkas)

Variabel dalam memori program akan hilang saat program dimatikan (*volatile*). Agar data tersimpan permanen (*persistent*), program perlu membaca dan menulis berkas pada media penyimpanan disk.

---

## 1. Membaca dan Menulis File Teks (`open`)

Gunakan konteks `with open(...)` agar berkas otomatis ditutup setelah selesai:

```python
# Menulis ke file
with open("names.txt", "a") as file:
    file.write("Hermione\n")

# Membaca seluruh baris dari file
with open("names.txt", "r") as file:
    for line in file:
        print("Hello,", line.rstrip())
```

---

## 2. File Berformat CSV (`csv`)

CSV (*Comma-Separated Values*) adalah format standar pertukaran data tabel:

```python
import csv

with open("students.csv", "r") as file:
    reader = csv.DictReader(file)
    for row in reader:
        print(f"{row['name']} berasal dari asrama {row['house']}")
```

---

## 3. Manipulasi Berkas Biner & Citra (Pillow / PIL)

Untuk berkas non-teks (seperti format citra JPEG/PNG), kita menggunakan pustaka `PIL` (Pillow):

```python
from PIL import Image

image = Image.open("input.jpg")
print(image.size)
print(image.format)
```
