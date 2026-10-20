# CS50P Week 4: Libraries & Modules

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
