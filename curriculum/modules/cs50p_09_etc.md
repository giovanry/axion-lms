# CS50P Week 9: Et Cetera (Fitur Lanjutan Python)

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
