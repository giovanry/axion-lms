# CS50P Problem Set 0: Einstein ($E = mc^2$) & Tip Calculator

Pada problem set pertama ini, Anda akan mempraktikkan konsep fungsi matematika, konversi tipe data numerik (`int` dan `float`), dan pembuatan fungsi modular.

---

## Soal 1: Einstein ($E = mc^2$)
Bahkan jika Anda belum mempelajari fisika modern, Anda tentu pernah mendengar rumus terkenal Albert Einstein:
$$E = mc^2$$
Di mana:
- $E$ adalah energi (Joule),
- $m$ adalah massa benda (kilogram),
- $c$ adalah kecepatan cahaya konstan, yaitu $300{,}000{,}000$ meter per detik ($3 \times 10^8\text{ m/s}$).

Tugas Anda adalah membuat fungsi `calculate_energy(mass_kg: int) -> int` yang menerima massa dalam kilogram (integer) dan mengembalikan energi ekuivalen dalam Joule (integer).

---

## Soal 2: Tip Calculator
Di restoran, seringkali tagihan makanan dikenakan tip persentase. Buat fungsi `calculate_tip(meal_cost: float, tip_percent: float) -> float` yang mengembalikan jumlah tip dalam desimal dibulatkan 2 digit:
$$\text{tip} = \text{meal\_cost} \times \left(\frac{\text{tip\_percent}}{100}\right)$$
