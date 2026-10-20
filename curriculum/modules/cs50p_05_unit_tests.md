# CS50P Week 5: Unit Tests & pytest

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
