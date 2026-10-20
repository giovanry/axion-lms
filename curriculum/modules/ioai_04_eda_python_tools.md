# Analisis Data Eksploratif (EDA) & Deteksi Outlier

Analisis Data Eksploratif (EDA) adalah proses kritis dalam memahami karakteristik struktur data, menemukan anomali, menguji hipotesis, dan memvisualisasikan korelasi sebelum data dilatihkan ke model machine learning.

---

## 1. Ukuran Pemusatan & Penyebaran Data

- **Mean (Rata-rata)**: $\bar{x} = \frac{1}{n} \sum_{i=1}^n x_i$
- **Median**: Nilai tengah data yang telah diurutkan (sangat tahan terhadap outlier/pencilan).
- **Varians ($s^2$)**: $s^2 = \frac{1}{n-1} \sum_{i=1}^n (x_i - \bar{x})^2$
- **Deviasi Standar ($s$)**: $s = \sqrt{s^2}$

---

## 2. Metode Deteksi Outlier (Pencilan)

### A. Metode Z-Score
Mengukur seberapa jauh suatu observasi dari rata-rata dalam satuan deviasi standar:
$$z = \frac{x - \mu}{\sigma}$$
Aturan empiris: Data dengan $|z| > 3$ umumnya diklasifikasikan sebagai outlier.

### B. Metode Interquartile Range (IQR)
Metode non-parametrik yang tangguh terhadap data yang tidak terdistribusi normal:
$$\text{IQR} = Q_3 - Q_1$$
Batas pencilan dihitung dengan:
$$\text{Batas Bawah} = Q_1 - 1.5 \times \text{IQR}$$
$$\text{Batas Atas} = Q_3 + 1.5 \times \text{IQR}$$

---

## 3. Visualisasi Data Utama dalam EDA

1. **Histogram**: Memperlihatkan bentuk distribusi frekuensi dan kecondongan (*skewness*).
2. **Box Plot**: Menampilkan lima angka ringkasan (Min, $Q_1$, Median, $Q_3$, Max) dan menandai titik outlier di luar batas whisker.
3. **Scatter Plot**: Meneliti hubungan korelasi bivariat antara dua fitur kontinu.
4. **Heatmap Matriks Korelasi**: Visualisasi matriks koefisien korelasi $r$ antar seluruh pasangan variabel dalam bentuk palet warna.