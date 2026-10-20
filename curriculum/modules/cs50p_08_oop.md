# CS50P Week 8: Object-Oriented Programming (OOP)

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
