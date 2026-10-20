# Teori Peluang, Variabel Acak, & Distribusi

Statistika dan teori peluang memberikan kerangka ilmiah untuk memodelkan ketidakpastian (*uncertainty*) dalam data, mengestimasi probabilitas kejadian, dan mengevaluasi keandalan model kecerdasan buatan.

---

## 1. Aturan Dasar Probabilitas & Teorema Bayes

### Aksioma Kolmogorov & Aturan Penjumlahan
Untuk dua kejadian $A$ dan $B$:
$$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$

### Probabilitas Bersyarat & Teorema Bayes
$$P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}$$
- $P(A)$: Prior probability (keyakinan awal sebelum melihat data).
- $P(B|A)$: Likelihood (peluang munculnya data $B$ bila hipotesis $A$ benar).
- $P(A|B)$: Posterior probability (keyakinan setelah memperhitungkan data bukti $B$).

---

## 2. Distribusi Probabilitas Teoretis

### 1. Distribusi Normal / Gaussian (Kontinu)
Distribusi simetris berbentuk lonceng yang paling fundamental dalam fenomena alam:
$$f(x) = \frac{1}{\sigma \sqrt{2\pi}} \exp\left( -\frac{(x - \mu)^2}{2\sigma^2} \right)$$
Di mana $\mu$ adalah nilai rata-rata (*mean*) dan $\sigma^2$ adalah varians.

### 2. Distribusi Binomial (Diskrit)
Memodelkan jumlah keberhasilan $k$ dari $n$ percobaan Bernoulli independen dengan peluang sukses $p$:
$$P(X = k) = \binom{n}{k} p^k (1 - p)^{n-k}$$

### 3. Distribusi Poisson (Diskrit)
Memodelkan frekuensi kemunculan kejadian langka dalam rentang waktu atau ruang tertentu:
$$P(X = k) = \frac{\lambda^k e^{-\lambda}}{k!}$$

---

## 3. Korelasi Pearson vs Kausalitas

Koefisien korelasi Pearson ($r$) mengukur kekuatan hubungan linear antara dua variabel:
$$r = \frac{\sum (X_i - \bar{X})(Y_i - \bar{Y})}{\sqrt{\sum (X_i - \bar{X})^2 \sum (Y_i - \bar{Y})^2}}$$
- $r = 1$: Hubungan linear positif sempurna.
- $r = -1$: Hubungan linear negatif sempurna.
- $r = 0$: Tidak ada hubungan linear.

> [!WARNING]
> **Korelasi Bukan Kausalitas**: Dua variabel yang memiliki korelasi tinggi ($r \approx 1$) belum tentu saling menyebabkan. Bisa terdapat variabel pengganggu (*confounding factor*).