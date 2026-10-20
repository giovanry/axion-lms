# build_cs50p_all.py
import json
from pathlib import Path
import sys

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

MODULES_DIR = BASE_DIR / "curriculum" / "modules"
MODULES_DIR.mkdir(parents=True, exist_ok=True)
MANIFEST_PATH = BASE_DIR / "curriculum" / "manifests" / "curriculum.json"

cs50p_lessons_content = {
    "cs50p_00_functions.md": """# CS50P Week 0: Functions & Variables

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
""",

    "cs50p_00_problem_set.md": """# CS50P Problem Set 0: Einstein ($E = mc^2$) & Tip Calculator

Pada problem set pertama ini, Anda akan mempraktikkan konsep fungsi matematika, konversi tipe data numerik (`int` dan `float`), dan pembuatan fungsi modular.

---

## Soal 1: Einstein ($E = mc^2$)
Bahkan jika Anda belum mempelajari fisika modern, Anda tentu pernah mendengar rumus terkenal Albert Einstein:
$$E = mc^2$$
Di mana:
- $E$ adalah energi (Joule),
- $m$ adalah massa benda (kilogram),
- $c$ adalah kecepatan cahaya konstan, yaitu $300{,}000{,}000$ meter per detik ($3 \\times 10^8\\text{ m/s}$).

Tugas Anda adalah membuat fungsi `calculate_energy(mass_kg: int) -> int` yang menerima massa dalam kilogram (integer) dan mengembalikan energi ekuivalen dalam Joule (integer).

---

## Soal 2: Tip Calculator
Di restoran, seringkali tagihan makanan dikenakan tip persentase. Buat fungsi `calculate_tip(meal_cost: float, tip_percent: float) -> float` yang mengembalikan jumlah tip dalam desimal dibulatkan 2 digit:
$$\\text{tip} = \\text{meal\\_cost} \\times \\left(\\frac{\\text{tip\\_percent}}{100}\\right)$$
""",

    "cs50p_01_conditionals.md": """# CS50P Week 1: Conditionals & Boolean Logic

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
""",

    "cs50p_01_problem_set.md": """# CS50P Problem Set 1: Deep Thought & File Extensions

Praktikkan penggunaan logika kondisional (`if`, `elif`, `else`) dan pencocokan teks pada Problem Set 1.

---

## Soal 1: Deep Thought (Jawaban atas Segala Hal)
Dalam novel fiksi ilmiah *The Hitchhiker's Guide to the Galaxy*, komputer super bernama Deep Thought membutuhkan waktu 7,5 juta tahun untuk menghitung Jawaban atas Pertanyaan Terbesar mengenai Kehidupan, Semesta, dan Segala Isinya. Jawabannya adalah `42`.

Implementasikan fungsi `is_great_answer(text: str) -> bool`:
- Kembalikan `True` jika input (tanpa memandang huruf besar/kecil atau spasi di tepi) adalah `"42"`, `"forty-two"`, atau `"forty two"`.
- Kembalikan `False` untuk jawaban lainnya.

---

## Soal 2: File Extensions (MIME Type Resolver)
Ketika berkas diunduh melalui internet, browser memeriksa ekstensi berkas untuk menentukan media type (MIME type).
Implementasikan fungsi `get_media_type(filename: str) -> str`:
- `.gif` -> `image/gif`
- `.jpg` atau `.jpeg` -> `image/jpeg`
- `.png` -> `image/png`
- `.pdf` -> `application/pdf`
- `.txt` -> `text/plain`
- `.zip` -> `application/zip`
- Jika berkas tidak memiliki ekstensi di atas, kembalikan `application/octet-stream`.
""",

    "cs50p_02_loops.md": """# CS50P Week 2: Loops & Data Sequences

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
""",

    "cs50p_02_problem_set.md": """# CS50P Problem Set 2: camelCase Converter & Twttr Vowel Stripper

Pada problem set ini, Anda akan menerapkan perulangan `for` dan manipulasi karakter string untuk memproses teks.

---

## Soal 1: camelCase ke snake_case
Dalam bahasa pemrograman seperti Java atau JavaScript, nama variabel sering ditulis dengan format **camelCase** (misal: `firstName`, `totalItemCount`). Namun, dalam konvensi Python PEP 8, nama variabel ditulis dalam format **snake_case** (huruf kecil semua dipisahkan garis bawah, misal: `first_name`, `total_item_count`).

Implementasikan fungsi `camel_to_snake(camel: str) -> str`:
- Setiap kali menemukan huruf besar, ubah menjadi garis bawah (`_`) diikuti huruf kecil yang bersangkutan.

---

## Soal 2: Just setting up my twttr
Ketika Twitter (sekarang X) pertama kali didirikan pada tahun 2006 oleh Jack Dorsey, nama aslinya dieja tanpa huruf vokal: **twttr**.

Implementasikan fungsi `shorten(word: str) -> str`:
- Hapus semua huruf vokal (`A`, `E`, `I`, `O`, `U`, baik huruf besar maupun huruf kecil) dari teks masukan dan kembalikan string hasilnya.
""",

    "cs50p_03_exceptions.md": """# CS50P Week 3: Exceptions & Error Handling

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
""",

    "cs50p_03_problem_set.md": """# CS50P Problem Set 3: Fuel Gauge (Pengukur Bahan Bakar)

Pada kendaraan bermotor, pengukur tangki bahan bakar biasanya menampilkan persentase bahan bakar yang tersisa sebagai pecahan atau huruf:
- Tangki penuh: **F** (Full) jika $\\ge 99\\%$.
- Tangki kosong: **E** (Empty) jika $\\le 1\\%$.
- Di antara rentang tersebut: persentase bilangan bulat diikuti `%` (misal `75%`).

---

## Spesifikasi Tugas
Implementasikan fungsi:
1. `convert(fraction_str: str) -> int`:
   - Menerima string berformat `"X/Y"`, di mana `X` dan `Y` adalah integer positif.
   - Mengembalikan persentase hasil pembagian $\\frac{X}{Y} \\times 100$ yang dibulatkan ke integer terdekat.
   - Melempar `ZeroDivisionError` jika penyebut $Y = 0$.
   - Melempar `ValueError` jika $X > Y$ atau jika format pecahan tidak valid.
2. `gauge(percentage: int) -> str`:
   - Jika `percentage <= 1`: kembalikan `"E"`.
   - Jika `percentage >= 99`: kembalikan `"F"`.
   - Jika lainnya: kembalikan `f"{percentage}%"`.
""",

    "cs50p_04_libraries.md": """# CS50P Week 4: Libraries & Modules

Salah satu kekuatan terbesar ekosistem Python adalah ribuan pustaka (*libraries*) bawaan dan pihak ketiga yang dapat diimpor untuk mempercepat pengembangan perangkat lunak.

---

## 1. Modul Bawaan Standar

- `random`: Menghasilkan nilai acak (`choice`, `randint`, `shuffle`).
- `statistics`: Perhitungan rata-rata (`mean`), median, dan modus.
- `sys`: Interaksi dengan sistem operasi dan argumen baris perintah (`sys.argv`).

```python
import random
import sys

cards = ["Jack", "Queen", "King", "Ace"]
random.shuffle(cards)
print("Kartu teratas:", cards[0])
```

---

## 2. Argumen Baris Perintah (`sys.argv`)

`sys.argv` adalah list yang berisi argumen yang diketikkan pengguna di terminal saat menjalankan skrip:

```python
import sys

if len(sys.argv) < 2:
    sys.exit("Terlalu sedikit argumen")

for arg in sys.argv[1:]:
    print("Halo,", arg)
```

---

## 3. Pustaka Pihak Ketiga & PyPI (`requests`)

Dengan `pip`, kita dapat memasang pustaka pihak ketiga seperti `requests` untuk berinteraksi dengan REST API web:

```python
import requests
import json

response = requests.get("https://itunes.apple.com/search?entity=song&limit=1&term=weezer")
data = response.json()
print(data["results"][0]["trackName"])
```
""",

    "cs50p_04_problem_set.md": """# CS50P Problem Set 4: Bitcoin Index & Little Professor

Praktikkan penggunaan modul standar Python dan pemrosesan data struktur kamus/JSON.

---

## Soal 1: Bitcoin Price Index Calculator
Katakanlah Anda memiliki $N$ keping Bitcoin dan ingin mengonversinya ke mata uang Dolar AS (USD) berdasarkan nilai tukar pasar terkini.

Implementasikan fungsi `calculate_bitcoin_value(n_bitcoins: float, price_usd: float) -> str`:
- Menghitung total nilai: $\\text{total} = n \\times \\text{price}$.
- Mengembalikan nilai yang diformat dengan tanda pemisah ribuan dan 4 digit desimal diawali simbol dolar: `f"${total:,.4f}"`.
- Contoh: untuk `2.5` BTC seharga `$38,765.1225`, hasilnya adalah `"$96,912.8063"`.

---

## Soal 2: Little Professor Math Game
Little Professor adalah mainan kalkulator elektronik retro dari era 1970-an yang memberikan soal matematika sederhana dan meminta pengguna menjawabnya.
Implementasikan fungsi `evaluate_math_answer(x: int, y: int, op: str, user_ans: int) -> bool`:
- Mendukung operator `"+"` dan `"-"`.
- Mengembalikan `True` jika jawaban pengguna tepat sesuai hasil operasi aritmatika, atau `False` jika salah.
""",

    "cs50p_05_unit_tests.md": """# CS50P Week 5: Unit Tests & pytest

Menguji kode secara manual dengan menjalankan program berkali-kali sangat membuang waktu dan rawan kesalahan (*human error*). *Unit Testing* memungkinkan pengujian otomatis terhadap setiap fungsi individual.

---

## 1. Kata Kunci `assert`

Pernyataan `assert` mengevaluasi ekspresi boolean. Jika kondisi salah, Python akan memicu `AssertionError`:

```python
def square(n):
    return n * n

def test_square():
    assert square(2) == 4
    assert square(3) == 9
    assert square(-2) == 4
    assert square(0) == 0
```

---

## 2. Pengujian dengan `pytest`

`pytest` adalah framework pengujian standar industri di Python. Aturan dasar:
- Nama file pengujian diawali dengan `test_` (misal `test_calculator.py`).
- Setiap fungsi pengujian diawali dengan `test_`.

```bash
# Menjalankan unit test di terminal
pytest test_calculator.py
```

---

## 3. Menguji Eksepsi dengan `pytest.raises`

Untuk menguji apakah suatu fungsi melempar galat yang diharapkan:

```python
import pytest

def test_divide_zero():
    with pytest.raises(ZeroDivisionError):
        divide(10, 0)
```
""",

    "cs50p_05_problem_set.md": """# CS50P Problem Set 5: Unit Testing twttr & Vanity Plates

Pada problem set ini, Anda akan menulis kumpulan fungsi pengujian (*unit tests*) untuk memastikan fungsi logika bisnis bebas dari bug dan regresi.

---

## Spesifikasi Tugas
Diberikan fungsi `shorten(word: str) -> str` dari Week 2. Buat kumpulan test assertions untuk menguji skenario batas (*edge cases*):
1. Kata tanpa huruf vokal (misal `"CS50"` -> `"CS50"`).
2. Kata dengan huruf vokal kecil (misal `"twitter"` -> `"twttr"`).
3. Kata dengan huruf vokal kapital (misal `"PYTHON"` -> `"PYTHN"`).
4. Kalimat dengan tanda baca dan angka (misal `"What's 123?"` -> `"Wht's 123?"`).

Tuliskan fungsi pengujian `run_twttr_tests(shorten_func)` yang memverifikasi seluruh skenario di atas menggunakan pernyataan `assert`.
""",

    "cs50p_06_file_io.md": """# CS50P Week 6: File I/O (Input & Output Berkas)

Variabel dalam memori program akan hilang saat program dimatikan (*volatile*). Agar data tersimpan permanen (*persistent*), program perlu membaca dan menulis berkas pada media penyimpanan disk.

---

## 1. Membaca dan Menulis File Teks (`open`)

Gunakan konteks `with open(...)` agar berkas otomatis ditutup setelah selesai:

```python
# Menulis ke file
with open("names.txt", "a") as file:
    file.write("Hermione\\n")

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
""",

    "cs50p_06_problem_set.md": """# CS50P Problem Set 6: Lines of Code & Scourgify Data Cleaner

Praktikkan manipulasi berkas teks dan struktur data CSV pada Problem Set 6.

---

## Soal 1: Lines of Code Counter
Berapa baris kode aktual yang ada dalam program Python Anda? Seringkali kita ingin mengabaikan baris kosong (*blank lines*) dan baris komentar yang diawali tanda pagar `#`.

Implementasikan fungsi `count_code_lines(source_code: str) -> int`:
- Mengabaikan baris yang hanya berisi spasi/kosong.
- Mengabaikan baris yang diawali dengan komentar `#` (setelah whitespace di-strip).
- Menghitung seluruh baris kode aktual lainnya.

---

## Soal 2: Scourgify Name Splitter
Diberikan daftar nama siswa dalam format `"Lastname, Firstname"` dalam catatan CSV.
Implementasikan fungsi `split_full_name(raw_name: str) -> tuple[str, str]`:
- Menguraikan `"Potter, Harry"` menjadi `("Harry", "Potter")`.
- Memastikan whitespace di awal dan akhir nama depan maupun nama belakang dibersihkan secara rapi.
""",

    "cs50p_07_regex.md": """# CS50P Week 7: Regular Expressions (RegEx)

*Regular Expressions* (pola ekspresi reguler) adalah pola pencocokan string yang sangat kuat untuk memvalidasi format input (seperti email, alamat IP, URL) dan mengekstrak substring spesifik.

---

## 1. Simbol Pola Dasar RegEx

- `^`: Cocok dengan awal string.
- `$`: Cocok dengan akhir string.
- `.`: Sembarang karakter kecuali baris baru.
- `*`: 0 atau lebih pengulangan.
- `+`: 1 atau lebih pengulangan.
- `?`: 0 atau 1 pengulangan (opsional).
- `\\d`: Sembarang digit desimal `[0-9]`.
- `\\w`: Karakter kata `[a-zA-Z0-9_]`.
- `\\s`: Spasi putih (*whitespace*).

---

## 2. Modul `re` di Python

```python
import re

email = input("Masukkan alamat email: ").strip()

# Validasi format email dasar: user@domain.com
if re.search(r"^[^@]+@[^@]+\\.[a-z]+$", email, re.IGNORECASE):
    print("Valid")
else:
    print("Tidak Valid")
```

---

## 3. Ekstraksi Data dengan Grup `(...)`

Tanda kurung `()` mendefinisikan grup tangkapan (*capture group*):

```python
import re

url = "https://www.youtube.com/watch?v=JP7ITIXGpHk"
if matches := re.search(r"^https?://(?:www\\.)?youtube\\.com/watch\\?v=([a-zA-Z0-9_-]+)", url):
    video_id = matches.group(1)
    print("ID Video:", video_id)
```
""",

    "cs50p_07_problem_set.md": """# CS50P Problem Set 7: NUMB3RS (IPv4 Validator) & YouTube Link Extractor

Praktikkan penggunaan modul `re` untuk memvalidasi dan mengekstrak data string.

---

## Soal 1: NUMB3RS (Validasi Alamat IPv4)
Alamat IPv4 (Internet Protocol versi 4) adalah alamat numerik berformat `##.#.#.#`, di mana setiap angka berkisar antara `0` hingga `255` inklusif (dipisahkan oleh tanda titik).

Implementasikan fungsi `validate_ipv4(ip: str) -> bool`:
- Kembalikan `True` jika string adalah alamat IPv4 yang valid (misal `"127.0.0.1"`, `"255.255.255.0"`, `"8.8.8.8"`).
- Kembalikan `False` jika format salah, ada nilai di luar rentang $0-255$ (misal `"275.3.6.28"`), atau terdapat huruf.

---

## Soal 2: YouTube Video ID Extractor
Implementasikan fungsi `extract_youtube_id(url: str) -> str | None`:
- Menerima URL YouTube berformat `https://www.youtube.com/watch?v=VIDEO_ID` atau `https://youtu.be/VIDEO_ID`.
- Mengembalikan ID video (misal `"JP7ITIXGpHk"`).
- Mengembalikan `None` jika bukan format URL YouTube yang sah.
""",

    "cs50p_08_oop.md": """# CS50P Week 8: Object-Oriented Programming (OOP)

*Object-Oriented Programming* (Pemrograman Berorientasi Objek) adalah paradigma pemrograman di mana data dan fungsionalitas dibundel bersama ke dalam entitas yang disebut **Objek** menggunakan cetak biru yang disebut **Kelas** (*Class*).

---

## 1. Mendefinisikan Kelas (`class`)

```python
class Student:
    def __init__(self, name: str, house: str):
        if not name:
            raise ValueError("Nama tidak boleh kosong")
        self.name = name
        self.house = house

    def __str__(self):
        return f"{self.name} dari asrama {self.house}"

student = Student("Harry", "Gryffindor")
print(student)
```

---

## 2. Properties: Getter & Setter (`@property`)

Untuk menjaga integritas data dan mencegah manipulasi atribut yang tidak sah:

```python
class Student:
    def __init__(self, name: str, house: str):
        self.name = name
        self.house = house  # Memanggil setter house

    @property
    def house(self):
        return self._house

    @house.setter
    def house(self, house):
        if house not in ["Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin"]:
            raise ValueError("Asrama tidak valid")
        self._house = house
```

---

## 3. Operator Overloading (`__add__`)

Kita dapat mendefinisikan bagaimana objek berinteraksi dengan operator matematika standar:

```python
class Vault:
    def __init__(self, galleons=0, sickles=0, knuts=0):
        self.galleons = galleons
        self.sickles = sickles
        self.knuts = knuts

    def __add__(self, other):
        return Vault(
            self.galleons + other.galleons,
            self.sickles + other.sickles,
            self.knuts + other.knuts
        )
```
""",

    "cs50p_08_problem_set.md": """# CS50P Problem Set 8: Cookie Jar (Toples Kue)

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
""",

    "cs50p_09_etc.md": """# CS50P Week 9: Et Cetera (Fitur Lanjutan Python)

Pada minggu penutup CS50P, kita mengeksplorasi berbagai fitur ekspresif dan idiomatik Python (*Pythonic idioms*) yang membuat kode lebih elegan, ringkas, dan efisien.

---

## 1. Tipe Data `set`

`set` adalah kumpulan elemen tak berurut yang unik (menghapus duplikasi secara otomatis):

```python
houses = set()
houses.add("Gryffindor")
houses.add("Gryffindor")
print(len(houses))  # Output: 1
```

---

## 2. List & Dictionary Comprehensions

Membuat list atau dict baru dalam satu baris ekspresi yang ekspresif:

```python
numbers = [1, 2, 3, 4, 5]
squares = [x ** 2 for x in numbers if x % 2 == 0]
print(squares)  # [4, 16]
```

---

## 3. Unpacking Argumen (`*args` dan `**kwargs`)

Operator `*` membuka urutan elemen list/tuple, sedangkan `**` membuka pasangan kamus (*dictionary*):

```python
def total(*args):
    return sum(args)

print(total(10, 20, 30))  # 60
```

---

## 4. Generator & Kata Kunci `yield`

Generator menghasilkan nilai satu per satu saat dibutuhkan (*lazy evaluation*), menghemat penggunaan memori RAM:

```python
def count_up_to(max_val):
    count = 1
    while count <= max_val:
        yield count
        count += 1
```
""",

    "cs50p_09_problem_set.md": """# CS50P Problem Set 9: Unpacking & Generator Pipeline

Praktikkan konsep pemrosesan data lanjutan, unpacking, dan generator.

---

## Soal 1: Filter & Square Even Numbers
Implementasikan fungsi `square_evens(numbers: list[int]) -> list[int]`:
- Menggunakan *list comprehension* untuk menyaring hanya bilangan genap, lalu menguadratkannya.
- Contoh: `[1, 2, 3, 4, 5, 6]` -> `[4, 16, 36]`.

---

## Soal 2: Fibonacci Generator
Implementasikan generator `fibonacci(n: int)`:
- Menghasilkan $n$ bilangan pertama dari deret Fibonacci ($0, 1, 1, 2, 3, 5, 8, \\dots$).
- Harus menggunakan kata kunci `yield`.
"""
}

# Write markdown files
for filename, content in cs50p_lessons_content.items():
    file_path = MODULES_DIR / filename
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Created: {file_path}")

cs50p_modules = [
    {
        "id": "module_cs50p_00_functions",
        "title": "Modul 11: [CS50P] Week 0: Functions & Variables",
        "description": "Pengenalan pemrograman Python Harvard CS50P: fungsi, argumen, string formatting, tipe data numerik (int/float), dan penulisan fungsi mandiri.",
        "level": "Dasar",
        "estimated_hours": 6,
        "track": "cs50p",
        "lessons": [
            {
                "id": "cs50p_00_theory",
                "title": "11.1 Kuliah Teori: Functions & Variables",
                "type": "THEORY",
                "content_path": "modules/cs50p_00_functions.md",
                "video_url": "https://www.youtube.com/embed/JP7ITIXGpHk",
                "quiz": {
                    "question": "Pada fungsi print() di Python, apa fungsi dari parameter bernama end= (misal: print('Halo', end=' '))?",
                    "options": [
                        "Menentukan karakter yang dicetak di akhir pemanggilan print (bawaannya adalah newline '\\n')",
                        "Menghapus spasi di awal string",
                        "Membuat teks dicetak dengan huruf kapital",
                        "Menghentikan jalannya program seketika"
                    ],
                    "correct_index": 0,
                    "explanation": "Secara default print() menambahkan karakter newline ('\\n') di akhir teks. Mengubah argumen end memungkinkan kita mencetak teks berikutnya di baris yang sama."
                }
            },
            {
                "id": "cs50p_00_pset",
                "title": "11.2 Problem Set 0: Einstein (E = mc²) & Tip Calculator",
                "type": "CODING",
                "content_path": "modules/cs50p_00_problem_set.md",
                "starter_code": "def calculate_energy(mass_kg: int) -> int:\n    # E = m * c^2, di mana c = 300_000_000 m/s\n    pass\n\ndef calculate_tip(meal_cost: float, tip_percent: float) -> float:\n    # Hitung nilai tip dibulatkan ke 2 desimal\n    pass\n",
                "test_assertions": "c = 300000000\nassert calculate_energy(1) == 1 * (c ** 2)\nassert calculate_energy(2) == 2 * (c ** 2)\nassert calculate_tip(50.0, 15.0) == 7.5\nassert calculate_tip(100.0, 18.0) == 18.0\nprint('CS50P Week 0 assertions passed!')"
            }
        ]
    },
    {
        "id": "module_cs50p_01_conditionals",
        "title": "Modul 12: [CS50P] Week 1: Conditionals",
        "description": "Logika percabangan: if, elif, else, operator logika (and, or, not), paritas modulo, dan pencocokan pola match.",
        "level": "Dasar",
        "estimated_hours": 6,
        "track": "cs50p",
        "lessons": [
            {
                "id": "cs50p_01_theory",
                "title": "12.1 Kuliah Teori: Conditionals & Boolean Logic",
                "type": "THEORY",
                "content_path": "modules/cs50p_01_conditionals.md",
                "video_url": "https://www.youtube.com/embed/_b6NgY_pMdw",
                "quiz": {
                    "question": "Manakah pernyataan di bawah ini yang benar mengenai evaluasi kondisional short-circuit di Python?",
                    "options": [
                        "Pada ekspresi (A or B), jika A bernilai True maka B tidak akan dievaluasi lagi",
                        "Python selalu mengevaluasi kedua sisi ekspresi tanpa memedulikan nilai sisi kiri",
                        "Ekspresi (A and B) selalu mengembalikan nilai string",
                        "Operator match tidak dapat dipadukan dengan tipe integer"
                    ],
                    "correct_index": 0,
                    "explanation": "Python menggunakan short-circuit evaluation: pada 'or', jika operand pertama sudah True, hasil akhir sudah pasti True sehingga operand kedua tidak diproses."
                }
            },
            {
                "id": "cs50p_01_pset",
                "title": "12.2 Problem Set 1: Deep Thought & File Extensions",
                "type": "CODING",
                "content_path": "modules/cs50p_01_problem_set.md",
                "starter_code": "def is_great_answer(text: str) -> bool:\n    # Periksa apakah teks bernilai 42, forty-two, atau forty two (case-insensitive)\n    pass\n\ndef get_media_type(filename: str) -> str:\n    # Kembalikan MIME type berdasarkan ekstensi berkas\n    pass\n",
                "test_assertions": "assert is_great_answer('42') is True\nassert is_great_answer(' Forty-Two ') is True\nassert is_great_answer('forty two') is True\nassert is_great_answer('50') is False\nassert get_media_type('cat.jpg') == 'image/jpeg'\nassert get_media_type('doc.pdf') == 'application/pdf'\nassert get_media_type('script.py') == 'application/octet-stream'\nprint('CS50P Week 1 assertions passed!')"
            }
        ]
    },
    {
        "id": "module_cs50p_02_loops",
        "title": "Modul 13: [CS50P] Week 2: Loops",
        "description": "Perulangan while dan for, manipulasi list dan dictionary, fungsi range, serta kontrol alur break dan continue.",
        "level": "Dasar",
        "estimated_hours": 6,
        "track": "cs50p",
        "lessons": [
            {
                "id": "cs50p_02_theory",
                "title": "13.1 Kuliah Teori: Loops & Data Sequences",
                "type": "THEORY",
                "content_path": "modules/cs50p_02_loops.md",
                "video_url": "https://www.youtube.com/embed/-7xg8pGcP6w",
                "quiz": {
                    "question": "Apa output dari range(2, 8, 2) ketika diubah menjadi list?",
                    "options": [
                        "[2, 4, 6]",
                        "[2, 4, 6, 8]",
                        "[2, 3, 4, 5, 6, 7, 8]",
                        "[4, 6, 8]"
                    ],
                    "correct_index": 0,
                    "explanation": "Fungsi range(start, stop, step) berhenti sebelum mencapai nilai stop (8 tidak termasuk). Dengan step 2, nilainya adalah 2, 4, dan 6."
                }
            },
            {
                "id": "cs50p_02_pset",
                "title": "13.2 Problem Set 2: camelCase Converter & Twttr",
                "type": "CODING",
                "content_path": "modules/cs50p_02_problem_set.md",
                "starter_code": "def camel_to_snake(camel: str) -> str:\n    # Konversi string camelCase ke snake_case\n    pass\n\ndef shorten(word: str) -> str:\n    # Hapus seluruh huruf vokal (A, E, I, O, U) dari kata masukan\n    pass\n",
                "test_assertions": "assert camel_to_snake('name') == 'name'\nassert camel_to_snake('firstName') == 'first_name'\nassert camel_to_snake('preferredFirstName') == 'preferred_first_name'\nassert shorten('Twitter') == 'Twttr'\nassert shorten('What is your name?') == 'Wht s yr nm?'\nassert shorten('AEIOUaeiou') == ''\nprint('CS50P Week 2 assertions passed!')"
            }
        ]
    },
    {
        "id": "module_cs50p_03_exceptions",
        "title": "Modul 14: [CS50P] Week 3: Exceptions",
        "description": "Penanganan eksepsi runtime dengan blok try, except, else, dan finally, serta validasi input yang tangguh.",
        "level": "Dasar-Menengah",
        "estimated_hours": 6,
        "track": "cs50p",
        "lessons": [
            {
                "id": "cs50p_03_theory",
                "title": "14.1 Kuliah Teori: Exceptions & Error Handling",
                "type": "THEORY",
                "content_path": "modules/cs50p_03_exceptions.md",
                "video_url": "https://www.youtube.com/embed/WvhQxXnnpk8",
                "quiz": {
                    "question": "Kapan kode di dalam blok else pada konstruksi try-except-else dieksekusi?",
                    "options": [
                        "Hanya ketika blok try berhasil dieksekusi tanpa memicu exception apa pun",
                        "Selalu dieksekusi baik terjadi exception maupun tidak",
                        "Ketika terjadi exception yang tidak tertangani oleh except",
                        "Hanya ketika pengguna menekan tombol Ctrl+C"
                    ],
                    "correct_index": 0,
                    "explanation": "Blok else berjalan secara eksklusif jika dan hanya jika blok try berjalan lancar tanpa memunculkan error sama sekali."
                }
            },
            {
                "id": "cs50p_03_pset",
                "title": "14.2 Problem Set 3: Fuel Gauge (Pengukur Tangki)",
                "type": "CODING",
                "content_path": "modules/cs50p_03_problem_set.md",
                "starter_code": "def convert(fraction_str: str) -> int:\n    # Parse string X/Y ke persentase integer (0-100)\n    # Lempar ZeroDivisionError jika Y == 0, ValueError jika X > Y atau invalid\n    pass\n\ndef gauge(percentage: int) -> str:\n    # <= 1 -> 'E', >= 99 -> 'F', lainnya -> '{percentage}%'\n    pass\n",
                "test_assertions": "assert convert('1/4') == 25\nassert convert('1/2') == 50\nassert convert('3/4') == 75\nassert gauge(1) == 'E'\nassert gauge(0) == 'E'\nassert gauge(99) == 'F'\nassert gauge(100) == 'F'\nassert gauge(75) == '75%'\nprint('CS50P Week 3 assertions passed!')"
            }
        ]
    },
    {
        "id": "module_cs50p_04_libraries",
        "title": "Modul 15: [CS50P] Week 4: Libraries",
        "description": "Penggunaan pustaka standar Python (random, sys, statistics) dan konsumsi API pihak ketiga via HTTP requests.",
        "level": "Menengah",
        "estimated_hours": 8,
        "track": "cs50p",
        "lessons": [
            {
                "id": "cs50p_04_theory",
                "title": "15.1 Kuliah Teori: Libraries & Modules",
                "type": "THEORY",
                "content_path": "modules/cs50p_04_libraries.md",
                "video_url": "https://www.youtube.com/embed/fR_P3mngoxg",
                "quiz": {
                    "question": "Pada list sys.argv, apa isi dari elemen pertama (indeks 0)?",
                    "options": [
                        "Nama berkas skrip Python yang sedang dijalankan",
                        "Argumen pertama yang diketikkan pengguna",
                        "Versi interpreter Python",
                        "Path absolut direktori kerja pengguna"
                    ],
                    "correct_index": 0,
                    "explanation": "sys.argv[0] selalu berisi nama skrip yang dieksekusi. Argumen pengguna dimulai dari sys.argv[1]."
                }
            },
            {
                "id": "cs50p_04_pset",
                "title": "15.2 Problem Set 4: Bitcoin Index & Little Professor",
                "type": "CODING",
                "content_path": "modules/cs50p_04_problem_set.md",
                "starter_code": "def calculate_bitcoin_value(n_bitcoins: float, price_usd: float) -> str:\n    # Format nilai: f'${total:,.4f}'\n    pass\n\ndef evaluate_math_answer(x: int, y: int, op: str, user_ans: int) -> bool:\n    # Evaluasi jawaban operasi penjumlahan atau pengurangan\n    pass\n",
                "test_assertions": "assert calculate_bitcoin_value(1.0, 50000.0) == '$50,000.0000'\nassert calculate_bitcoin_value(2.5, 38765.1225) == '$96,912.8063'\nassert evaluate_math_answer(5, 7, '+', 12) is True\nassert evaluate_math_answer(10, 4, '-', 6) is True\nassert evaluate_math_answer(10, 4, '-', 5) is False\nprint('CS50P Week 4 assertions passed!')"
            }
        ]
    },
    {
        "id": "module_cs50p_05_unit_tests",
        "title": "Modul 16: [CS50P] Week 5: Unit Tests",
        "description": "Pengujian perangkat lunak otomatis: kata kunci assert, framework pytest, dan pengorganisasian suite pengujian.",
        "level": "Menengah",
        "estimated_hours": 6,
        "track": "cs50p",
        "lessons": [
            {
                "id": "cs50p_05_theory",
                "title": "16.1 Kuliah Teori: Unit Tests & pytest",
                "type": "THEORY",
                "content_path": "modules/cs50p_05_unit_tests.md",
                "video_url": "https://www.youtube.com/embed/tIrcGEbpt48",
                "quiz": {
                    "question": "Konvensi penamaan apa yang diwajibkan oleh pytest agar sebuah fungsi otomatis dikenali sebagai fungsi pengujian?",
                    "options": [
                        "Nama fungsi harus diawali dengan 'test_' (misal: test_calculate)",
                        "Fungsi harus diakhiri dengan '_check'",
                        "Fungsi harus diberi dekorator @test",
                        "Nama berkas harus berawalan huruf kapital"
                    ],
                    "correct_index": 0,
                    "explanation": "pytest secara otomatis mendeteksi berkas dengan pola test_*.py atau *_test.py serta fungsi yang diawali dengan kata test_."
                }
            },
            {
                "id": "cs50p_05_pset",
                "title": "16.2 Problem Set 5: Unit Testing Suite",
                "type": "CODING",
                "content_path": "modules/cs50p_05_problem_set.md",
                "starter_code": "def run_twttr_tests(shorten_func) -> bool:\n    # Uji shorten_func dengan assert untuk berbagai skenario (vokal kapital, kecil, angka, tanda baca)\n    # Kembalikan True jika seluruh pengujian lolos\n    pass\n",
                "test_assertions": "def dummy_shorten(word):\n    vowels = 'aeiouAEIOU'\n    return ''.join(c for c in word if c not in vowels)\nassert run_twttr_tests(dummy_shorten) is True\nprint('CS50P Week 5 assertions passed!')"
            }
        ]
    },
    {
        "id": "module_cs50p_06_file_io",
        "title": "Modul 17: [CS50P] Week 6: File I/O",
        "description": "Membaca dan menulis berkas teks permanen, parsing data tabular CSV dengan DictReader, dan pengenalan citra digital.",
        "level": "Menengah",
        "estimated_hours": 8,
        "track": "cs50p",
        "lessons": [
            {
                "id": "cs50p_06_theory",
                "title": "17.1 Kuliah Teori: File Input & Output",
                "type": "THEORY",
                "content_path": "modules/cs50p_06_file_io.md",
                "video_url": "https://www.youtube.com/embed/e4Wq_u2U-dY",
                "quiz": {
                    "question": "Mengapa penggunaan konstruksi 'with open(...) as file:' lebih disarankan daripada 'file = open(...)'?",
                    "options": [
                        "Konteks with secara otomatis menutup berkas bahkan jika terjadi exception saat pemrosesan",
                        "Konteks with membaca file lebih cepat",
                        "Konteks with mengubah file menjadi database SQL otomatis",
                        "Konteks with mengenkripsi isi file secara otomatis"
                    ],
                    "correct_index": 0,
                    "explanation": "with menggunakan context manager yang menjamin fungsi file.close() dipanggil saat keluar dari blok kode, mencegah memory leak."
                }
            },
            {
                "id": "cs50p_06_pset",
                "title": "17.2 Problem Set 6: Lines of Code & Scourgify",
                "type": "CODING",
                "content_path": "modules/cs50p_06_problem_set.md",
                "starter_code": "def count_code_lines(source_code: str) -> int:\n    # Hitung jumlah baris aktual kode (abaikan baris kosong dan komentar berawalan #)\n    pass\n\ndef split_full_name(raw_name: str) -> tuple[str, str]:\n    # 'Potter, Harry' -> ('Harry', 'Potter')\n    pass\n",
                "test_assertions": "code_sample = '# Ini komentar\\n\\nx = 10\\n# Komentar lagi\\nprint(x)\\n'\nassert count_code_lines(code_sample) == 2\nassert split_full_name('Potter, Harry') == ('Harry', 'Potter')\nassert split_full_name('Granger, Hermione ') == ('Hermione', 'Granger')\nprint('CS50P Week 6 assertions passed!')"
            }
        ]
    },
    {
        "id": "module_cs50p_07_regex",
        "title": "Modul 18: [CS50P] Week 7: Regular Expressions",
        "description": "Pola ekspresi reguler re: sintaks wildcard, kuantifikasi (*, +, ?), karakter khusus, capture groups, dan walrus operator.",
        "level": "Lanjutan",
        "estimated_hours": 8,
        "track": "cs50p",
        "lessons": [
            {
                "id": "cs50p_07_theory",
                "title": "18.1 Kuliah Teori: Regular Expressions (RegEx)",
                "type": "THEORY",
                "content_path": "modules/cs50p_07_regex.md",
                "video_url": "https://www.youtube.com/embed/hy3ZdJduqJU",
                "quiz": {
                    "question": "Pada pola regex r'^a.*b$', apa arti simbol ^ dan $?",
                    "options": [
                        "^ mencocokkan awal string, dan $ mencocokkan akhir string",
                        "^ mencocokkan karakter spasi, dan $ mencocokkan simbol mata uang",
                        "^ dan $ adalah karakter escape untuk tanda kurung",
                        "^ mengabaikan huruf besar, dan $ mengabaikan tanda baca"
                    ],
                    "correct_index": 0,
                    "explanation": "^ adalah anchor awal string dan $ adalah anchor akhir string, memastikan seluruh panjang string cocok dengan pola."
                }
            },
            {
                "id": "cs50p_07_pset",
                "title": "18.2 Problem Set 7: NUMB3RS (IPv4 Validator)",
                "type": "CODING",
                "content_path": "modules/cs50p_07_problem_set.md",
                "starter_code": "import re\n\ndef validate_ipv4(ip: str) -> bool:\n    # Validasi format IPv4: 4 blok angka 0-255 dipisahkan titik\n    pass\n\ndef extract_youtube_id(url: str) -> str | None:\n    # Ekstrak ID video YouTube dari URL standar atau tautan pendek youtu.be\n    pass\n",
                "test_assertions": "assert validate_ipv4('127.0.0.1') is True\nassert validate_ipv4('255.255.255.255') is True\nassert validate_ipv4('512.1.1.1') is False\nassert validate_ipv4('1.2.3.1000') is False\nassert validate_ipv4('cat') is False\nassert extract_youtube_id('https://www.youtube.com/watch?v=JP7ITIXGpHk') == 'JP7ITIXGpHk'\nassert extract_youtube_id('https://youtu.be/_b6NgY_pMdw') == '_b6NgY_pMdw'\nprint('CS50P Week 7 assertions passed!')"
            }
        ]
    },
    {
        "id": "module_cs50p_08_oop",
        "title": "Modul 19: [CS50P] Week 8: Object-Oriented Programming",
        "description": "Paradigma OOP: class, atribut instance, method khusus (__init__, __str__), properti (@property), dan enkapsulasi.",
        "level": "Lanjutan",
        "estimated_hours": 10,
        "track": "cs50p",
        "lessons": [
            {
                "id": "cs50p_08_theory",
                "title": "19.1 Kuliah Teori: Object-Oriented Programming",
                "type": "THEORY",
                "content_path": "modules/cs50p_08_oop.md",
                "video_url": "https://www.youtube.com/embed/E-C_yFj5F54",
                "quiz": {
                    "question": "Apa peran dari method khusus __str__ di dalam sebuah class Python?",
                    "options": [
                        "Mengembalikan representasi string yang mudah dibaca ketika objek dicetak atau dikonversi dengan str(obj)",
                        "Menginisialisasi nilai variabel pertama kali",
                        "Menghapus objek dari memori RAM komputer",
                        "Mengubah semua method dalam kelas menjadi method statis"
                    ],
                    "correct_index": 0,
                    "explanation": "__str__ dipanggil oleh fungsi bawaan print() dan str() untuk menyajikan representasi string yang manusiawi bagi pengguna."
                }
            },
            {
                "id": "cs50p_08_pset",
                "title": "19.2 Problem Set 8: Cookie Jar (Toples Kue)",
                "type": "CODING",
                "content_path": "modules/cs50p_08_problem_set.md",
                "starter_code": "class Jar:\n    def __init__(self, capacity: int = 12):\n        if not isinstance(capacity, int) or capacity < 0:\n            raise ValueError('Capacity must be non-negative integer')\n        self._capacity = capacity\n        self._size = 0\n\n    def __str__(self) -> str:\n        return '🍪' * self._size\n\n    def deposit(self, n: int) -> None:\n        if self._size + n > self._capacity:\n            raise ValueError('Exceeds capacity')\n        self._size += n\n\n    def withdraw(self, n: int) -> None:\n        if n > self._size:\n            raise ValueError('Not enough cookies')\n        self._size -= n\n\n    @property\n    def capacity(self) -> int:\n        return self._capacity\n\n    @property\n    def size(self) -> int:\n        return self._size\n",
                "test_assertions": "jar = Jar(10)\nassert jar.capacity == 10\nassert jar.size == 0\njar.deposit(3)\nassert jar.size == 3\nassert str(jar) == '🍪🍪🍪'\njar.withdraw(1)\nassert jar.size == 2\nassert str(jar) == '🍪🍪'\nprint('CS50P Week 8 assertions passed!')"
            }
        ]
    },
    {
        "id": "module_cs50p_09_etc",
        "title": "Modul 20: [CS50P] Week 9: Et Cetera",
        "description": "Fitur Pythonic tingkat lanjut: set, list/dict comprehensions, unpacking (*args, **kwargs), generator dan yield.",
        "level": "Lanjutan",
        "estimated_hours": 8,
        "track": "cs50p",
        "lessons": [
            {
                "id": "cs50p_09_theory",
                "title": "20.1 Kuliah Teori: Fitur Idiomatik Python",
                "type": "THEORY",
                "content_path": "modules/cs50p_09_etc.md",
                "video_url": "https://www.youtube.com/embed/45607ksw5J4",
                "quiz": {
                    "question": "Apa keunggulan fungsi generator yang menggunakan kata kunci yield dibandingkan fungsi biasa yang mengembalikan list?",
                    "options": [
                        "Generator menghitung dan menghasilkan elemen satu per satu saat dibutuhkan, sangat hemat memori untuk dataset masif",
                        "Generator secara otomatis mengonversi kode menjadi bahasa C",
                        "Generator tidak dapat dihentikan oleh program",
                        "Generator hanya bisa menghasilkan nilai boolean"
                    ],
                    "correct_index": 0,
                    "explanation": "Konsep lazy evaluation pada generator menghemat RAM secara drastis karena seluruh elemen tidak perlu dimuat sekaligus ke memori."
                }
            },
            {
                "id": "cs50p_09_pset",
                "title": "20.2 Problem Set 9: Comprehensions & Fibonacci Generator",
                "type": "CODING",
                "content_path": "modules/cs50p_09_problem_set.md",
                "starter_code": "def square_evens(numbers: list[int]) -> list[int]:\n    # Kembalikan list kuadrat dari bilangan genap menggunakan list comprehension\n    pass\n\ndef fibonacci(n: int):\n    # Generator yang menghasilkan n bilangan pertama Fibonacci menggunakan yield\n    pass\n",
                "test_assertions": "assert square_evens([1, 2, 3, 4, 5, 6]) == [4, 16, 36]\nfib_gen = fibonacci(5)\nassert list(fib_gen) == [0, 1, 1, 2, 3]\nprint('CS50P Week 9 assertions passed!')"
            }
        ]
    }
]

# Load existing curriculum manifest
with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
    existing_manifest = json.load(f)

# Ensure existing modules have tracks:
# Modul 1-5 -> 'kurikulum_awal'
# Modul 6-10 -> 'ioai'
for mod in existing_manifest:
    if "ioai" in mod["id"]:
        mod["track"] = "ioai"
    else:
        mod["track"] = "kurikulum_awal"

# Filter out any old cs50p modules if re-running
clean_manifest = [m for m in existing_manifest if not m.get("id", "").startswith("module_cs50p")]

# Append new cs50p modules
full_manifest = clean_manifest + cs50p_modules

# Write back updated manifest
with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
    json.dump(full_manifest, f, indent=2, ensure_ascii=False)

print(f"Updated curriculum manifest with {len(full_manifest)} modules!")

# Sync to SQLite database
import sqlite3
DB_PATH = BASE_DIR / "olympus.db"
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
for mod in full_manifest:
    module_id = mod.get("id", "mod_0")
    module_title = mod.get("title", "Module")
    lessons = mod.get("lessons", [])
    for order, lesson in enumerate(lessons):
        lesson_id = lesson.get("id")
        cur.execute("SELECT id FROM modules_lessons WHERE id = ?", (lesson_id,))
        if not cur.fetchone():
            cur.execute(
                """INSERT INTO modules_lessons
                   (id, module_id, module_title, title, type, content_path, is_completed, order_index)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    lesson_id,
                    module_id,
                    module_title,
                    lesson.get("title", ""),
                    lesson.get("type", "THEORY"),
                    lesson.get("content_path", ""),
                    False,
                    order,
                ),
            )
conn.commit()
conn.close()
print("Synchronized all curriculum modules to SQLite database successfully!")
