# Unsupervised Learning: Algoritma Clustering

*Clustering* adalah metode pembelajaran tanpa supervisi (*unsupervised learning*) untuk mengelompokkan data yang tidak memiliki label ke dalam klaster-klaster alami berdasarkan kesamaan fitur (*similarity*).

---

## 1. Algoritma K-Means

Mengelompokkan $N$ sampel data ke dalam $K$ klaster yang telah ditentukan sebelumnya.

### Objektif Matematis (Inersia / WCSS):
Meminimalkan *Within-Cluster Sum of Squares*:
$$J = \sum_{k=1}^K \sum_{\mathbf{x}_i \in C_k} \|\mathbf{x}_i - \boldsymbol{\mu}_k\|^2$$
Di mana $\boldsymbol{\mu}_k$ adalah titik pusat (*centroid*) dari klaster $C_k$.

### Algoritma Lloyd:
1. Inisialisasi $K$ centroid secara acak (atau menggunakan inisialisasi cerdas **K-Means++**).
2. **Tahap Assignment**: Setiap titik data dialokasikan ke centroid terdekat berdasarkan jarak Euclidean.
3. **Tahap Update**: Hitung ulang posisi centroid sebagai rata-rata dari seluruh anggota klaster tersebut:
   $$\boldsymbol{\mu}_k = \frac{1}{|C_k|} \sum_{\mathbf{x} \in C_k} \mathbf{x}$$
4. Ulangi tahap 2 dan 3 hingga posisi centroid tidak lagi berpindah secara signifikan.

---

## 2. Hierarchical Clustering (Dendrogram)

Membangun struktur hierarki klaster bertingkat tanpa perlu menentukan nilai $K$ di awal:
- **Aglomeratif (Bottom-Up)**: Dimulai dari setiap titik sebagai klaster mandiri, kemudian menggabungkan pasangan klaster terdekat secara bertahap hingga tersisa 1 klaster besar.
- Metode keterkaitan (*Linkage*):
  - *Single Linkage*: Jarak minimum antar anggota.
  - *Complete Linkage*: Jarak maksimum antar anggota.
  - *Ward Linkage*: Meminimalkan penambahan varians total.

---

## 3. Evaluasi Kualitas Klaster: Silhouette Score

Koefisien Silhouette mengukur seberapa dekat suatu titik dengan kelompoknya sendiri dibandingkan kelompok lain:
$$s(i) = \frac{b(i) - a(i)}{\max(a(i), b(i))}$$
- $a(i)$: Rata-rata jarak titik $i$ ke seluruh titik lain dalam klaster yang sama.
- $b(i)$: Rata-rata jarak titik $i$ ke titik dalam klaster terdekat berikutnya.
- Nilai $s(i) \in [-1, 1]$. Nilai mendekati $+1$ mengindikasikan klaster terpisah dengan sangat baik dan padat.