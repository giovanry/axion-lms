# build_ioai_all.py
import json
from pathlib import Path
import sys

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

MODULES_DIR = BASE_DIR / "curriculum" / "modules"
MODULES_DIR.mkdir(parents=True, exist_ok=True)
MANIFEST_PATH = BASE_DIR / "curriculum" / "manifests" / "curriculum.json"

lessons_content = {
    "ioai_01_linear_algebra.md": """# Aljabar Linear: Vektor, Matriks, & Dekomposisi Spektral

Aljabar linear adalah fondasi universal untuk merepresentasikan dan memanipulasi data dalam *Machine Learning* dan *Artificial Intelligence*. Seluruh struktur komputasi modern—mulai dari citra digital (tensor 3D), representasi kata (vektor berdimensi tinggi), hingga kumpulan bobot jaringan saraf tiruan—beroperasi di atas ruang vektor aljabar linear.

---

## 1. Skalar, Vektor, dan Matriks

- **Skalar** ($s \\in \\mathbb{R}$): Nilai numerik tunggal berdimensi nol.
- **Vektor** ($\\mathbf{x} \\in \\mathbb{R}^n$): Kumpulan nilai berdimensi 1 yang merepresentasikan arah dan magnitudo:
  $$\\mathbf{x} = \\begin{bmatrix} x_1 \\\\ x_2 \\\\ \\vdots \\\\ x_n \\end{bmatrix}$$
- **Matriks** ($\\mathbf{A} \\in \\mathbb{R}^{m \\times n}$): Susunan array 2 dimensi dengan $m$ baris dan $n$ kolom:
  $$\\mathbf{A} = \\begin{bmatrix} a_{11} & a_{12} & \\cdots & a_{1n} \\\\ a_{21} & a_{22} & \\cdots & a_{2n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ a_{m1} & a_{m2} & \\cdots & a_{mn} \\end{bmatrix}$$

---

## 2. Operasi Fundamental Matriks

### Perkalian Titik (Dot Product)
Untuk dua vektor $\\mathbf{u}, \\mathbf{v} \\in \\mathbb{R}^n$:
$$\\mathbf{u} \\cdot \\mathbf{v} = \\mathbf{u}^T \\mathbf{v} = \\sum_{i=1}^n u_i v_i = \\|\\mathbf{u}\\| \\|\\mathbf{v}\\| \\cos(\\theta)$$
Dot product mengukur kemiripan arah (*directional similarity*) antar dua vektor.

### Perkalian Matriks
Dua matriks $\\mathbf{A} \\in \\mathbb{R}^{m \\times k}$ dan $\\mathbf{B} \\in \\mathbb{R}^{k \\times n}$ menghasilkan matriks $\\mathbf{C} = \\mathbf{A}\\mathbf{B} \\in \\mathbb{R}^{m \\times n}$:
$$c_{ij} = \\sum_{p=1}^k a_{ip} b_{pj}$$

> [!NOTE]
> Syarat perkalian matriks: jumlah kolom matriks pertama harus sama persis dengan jumlah baris matriks kedua.

---

## 3. Invers dan Rank Matriks

### Invers Matriks ($\\mathbf{A}^{-1}$)
Untuk matriks persegi $\\mathbf{A} \\in \\mathbb{R}^{n \\times n}$, invers didefinisikan sebagai:
$$\\mathbf{A} \\mathbf{A}^{-1} = \\mathbf{A}^{-1} \\mathbf{A} = \\mathbf{I}_n$$
Matriks memiliki invers (non-singular) jika dan hanya jika determinannya tidak nol: $\\det(\\mathbf{A}) \\neq 0$.

### Rank Matriks
Rank matriks adalah jumlah maksimum kolom (atau baris) yang saling bebas linear (*linearly independent*).
- Jika $\\text{rank}(\\mathbf{A}) = \\min(m, n)$, matriks dikatakan memiliki **full rank**.
- Rank menentukan kapasitas informasi dan dimensi efektif ruang kolom dari data.

---

## 4. Eigenvalue, Eigenvector, & SVD

### Persamaan Karakteristik Eigen
Untuk transformasi matriks persegi $\\mathbf{A}$:
$$\\mathbf{A} \\mathbf{v} = \\lambda \\mathbf{v}$$
Di mana $\\mathbf{v} \\neq \\mathbf{0}$ adalah **eigenvector** dan $\\lambda$ adalah skalar **eigenvalue**. Matriks hanya meregangkan vektor $\\mathbf{v}$ sebesar faktor $\\lambda$ tanpa mengubah orientasi garis vektornya.

### Singular Value Decomposition (SVD)
Setiap matriks nyata $\\mathbf{A} \\in \\mathbb{R}^{m \\times n}$ dapat difaktorisasi menjadi tiga matriks:
$$\\mathbf{A} = \\mathbf{U} \\mathbf{\\Sigma} \\mathbf{V}^T$$
- $\\mathbf{U} \\in \\mathbb{R}^{m \\times m}$: Matriks ortogonal vektor singular kiri (eigenvector dari $\\mathbf{A}\\mathbf{A}^T$).
- $\\mathbf{\\Sigma} \\in \\mathbb{R}^{m \\times n}$: Matriks diagonal dengan nilai singular non-negatif ($\\sigma_1 \\ge \\sigma_2 \\ge \\dots \\ge 0$).
- $\\mathbf{V} \\in \\mathbb{R}^{n \\times n}$: Matriks ortogonal vektor singular kanan (eigenvector dari $\\mathbf{A}^T\\mathbf{A}$).

---

## 5. Contoh Kode NumPy

```python
import numpy as np

A = np.array([[4.0, 2.0], [1.0, 3.0]])
eigenvalues, eigenvectors = np.linalg.eig(A)
print("Eigenvalues:", eigenvalues)
print("Eigenvectors:\n", eigenvectors)

U, S, Vt = np.linalg.svd(A)
print("Singular Values:", S)
```
""",

    "ioai_02_calculus_optimization.md": """# Kalkulus Multivariat & Teori Optimasi

Optimasi adalah jantung dari proses pembelajaran mesin. Hampir seluruh algoritma *Machine Learning* dan *Deep Learning* bekerja dengan memformulasikan tujuan sebagai fungsi biaya (*loss/cost function*), kemudian mencari parameter model yang meminimalkan nilai fungsi tersebut menggunakan kalkulus diferensial.

---

## 1. Turunan Parsial & Vektor Gradien

### Turunan Parsial
Untuk fungsi multivariat $f(x_1, x_2, \\dots, x_n)$, turunan parsial terhadap variabel $x_i$ mengukur laju perubahan fungsi ketika hanya variabel $x_i$ yang divariasikan:
$$\\frac{\\partial f}{\\partial x_i} = \\lim_{h \\to 0} \\frac{f(x_1, \\dots, x_i + h, \\dots, x_n) - f(x_1, \\dots, x_i, \\dots, x_n)}{h}$$

### Vektor Gradien ($\\nabla f$)
Gradien mengumpulkan seluruh turunan parsial ke dalam satu vektor kolom:
$$\\nabla f(\\mathbf{x}) = \\begin{bmatrix} \\frac{\\partial f}{\\partial x_1} \\\\ \\frac{\\partial f}{\\partial x_2} \\\\ \\vdots \\\\ \\frac{\\partial f}{\\partial x_n} \\end{bmatrix}$$

> [!IMPORTANT]
> **Arah Gradien**: Vektor gradien $\\nabla f(\\mathbf{x})$ selalu menunjuk ke arah **peningkatan fungsi tercepat** (*steepest ascent*). Untuk meminimalkan fungsi loss, pembaruan parameter bergerak ke arah sebaliknya: $-\\nabla f(\\mathbf{x})$ (*steepest descent*).

---

## 2. Matriks Hessian & Uji Kelengkungan

Matriks Hessian $\\mathbf{H}$ memuat seluruh turunan parsial orde dua dari fungsi $f$:
$$\\mathbf{H}_{ij} = \\frac{\\partial^2 f}{\\partial x_i \\partial x_j}$$
- Jika matriks Hessian **definit positif** (seluruh eigenvalue $> 0$) pada titik stasioner $\\nabla f = \\mathbf{0}$, titik tersebut adalah **minimum lokal**.
- Jika **definit negatif** (seluruh eigenvalue $< 0$), titik tersebut adalah **maksimum lokal**.
- Jika memiliki eigenvalue positif dan negatif, titik tersebut adalah **saddle point** (titik pelana).

---

## 3. Algoritma Gradient Descent

Rumus pembaruan parameter iteratif untuk bobot $\\theta$:
$$\\theta_{t+1} = \\theta_t - \\alpha \\nabla_\\theta \\mathcal{L}(\\theta_t)$$
Di mana $\\alpha > 0$ adalah **learning rate** (laju pembelajaran).

```python
import numpy as np

def loss_func(w):
    return (w - 3.5)**2 + 2.0

def grad_loss(w):
    return 2 * (w - 3.5)

w = 10.0
lr = 0.1
for step in range(25):
    w -= lr * grad_loss(w)

print(f"Hasil konvergensi bobot optimal w*: {w:.4f}")
```
""",

    "ioai_03_stats_probability.md": """# Teori Peluang, Variabel Acak, & Distribusi

Statistika dan teori peluang memberikan kerangka ilmiah untuk memodelkan ketidakpastian (*uncertainty*) dalam data, mengestimasi probabilitas kejadian, dan mengevaluasi keandalan model kecerdasan buatan.

---

## 1. Aturan Dasar Probabilitas & Teorema Bayes

### Aksioma Kolmogorov & Aturan Penjumlahan
Untuk dua kejadian $A$ dan $B$:
$$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$$

### Probabilitas Bersyarat & Teorema Bayes
$$P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}$$
- $P(A)$: Prior probability (keyakinan awal sebelum melihat data).
- $P(B|A)$: Likelihood (peluang munculnya data $B$ bila hipotesis $A$ benar).
- $P(A|B)$: Posterior probability (keyakinan setelah memperhitungkan data bukti $B$).

---

## 2. Distribusi Probabilitas Teoretis

### 1. Distribusi Normal / Gaussian (Kontinu)
Distribusi simetris berbentuk lonceng yang paling fundamental dalam fenomena alam:
$$f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} \\exp\\left( -\\frac{(x - \\mu)^2}{2\\sigma^2} \\right)$$
Di mana $\\mu$ adalah nilai rata-rata (*mean*) dan $\\sigma^2$ adalah varians.

### 2. Distribusi Binomial (Diskrit)
Memodelkan jumlah keberhasilan $k$ dari $n$ percobaan Bernoulli independen dengan peluang sukses $p$:
$$P(X = k) = \\binom{n}{k} p^k (1 - p)^{n-k}$$

### 3. Distribusi Poisson (Diskrit)
Memodelkan frekuensi kemunculan kejadian langka dalam rentang waktu atau ruang tertentu:
$$P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}$$

---

## 3. Korelasi Pearson vs Kausalitas

Koefisien korelasi Pearson ($r$) mengukur kekuatan hubungan linear antara dua variabel:
$$r = \\frac{\\sum (X_i - \\bar{X})(Y_i - \\bar{Y})}{\\sqrt{\\sum (X_i - \\bar{X})^2 \\sum (Y_i - \\bar{Y})^2}}$$
- $r = 1$: Hubungan linear positif sempurna.
- $r = -1$: Hubungan linear negatif sempurna.
- $r = 0$: Tidak ada hubungan linear.

> [!WARNING]
> **Korelasi Bukan Kausalitas**: Dua variabel yang memiliki korelasi tinggi ($r \\approx 1$) belum tentu saling menyebabkan. Bisa terdapat variabel pengganggu (*confounding factor*).
""",

    "ioai_04_eda_python_tools.md": """# Analisis Data Eksploratif (EDA) & Deteksi Outlier

Analisis Data Eksploratif (EDA) adalah proses kritis dalam memahami karakteristik struktur data, menemukan anomali, menguji hipotesis, dan memvisualisasikan korelasi sebelum data dilatihkan ke model machine learning.

---

## 1. Ukuran Pemusatan & Penyebaran Data

- **Mean (Rata-rata)**: $\\bar{x} = \\frac{1}{n} \\sum_{i=1}^n x_i$
- **Median**: Nilai tengah data yang telah diurutkan (sangat tahan terhadap outlier/pencilan).
- **Varians ($s^2$)**: $s^2 = \\frac{1}{n-1} \\sum_{i=1}^n (x_i - \\bar{x})^2$
- **Deviasi Standar ($s$)**: $s = \\sqrt{s^2}$

---

## 2. Metode Deteksi Outlier (Pencilan)

### A. Metode Z-Score
Mengukur seberapa jauh suatu observasi dari rata-rata dalam satuan deviasi standar:
$$z = \\frac{x - \\mu}{\\sigma}$$
Aturan empiris: Data dengan $|z| > 3$ umumnya diklasifikasikan sebagai outlier.

### B. Metode Interquartile Range (IQR)
Metode non-parametrik yang tangguh terhadap data yang tidak terdistribusi normal:
$$\\text{IQR} = Q_3 - Q_1$$
Batas pencilan dihitung dengan:
$$\\text{Batas Bawah} = Q_1 - 1.5 \\times \\text{IQR}$$
$$\\text{Batas Atas} = Q_3 + 1.5 \\times \\text{IQR}$$

---

## 3. Visualisasi Data Utama dalam EDA

1. **Histogram**: Memperlihatkan bentuk distribusi frekuensi dan kecondongan (*skewness*).
2. **Box Plot**: Menampilkan lima angka ringkasan (Min, $Q_1$, Median, $Q_3$, Max) dan menandai titik outlier di luar batas whisker.
3. **Scatter Plot**: Meneliti hubungan korelasi bivariat antara dua fitur kontinu.
4. **Heatmap Matriks Korelasi**: Visualisasi matriks koefisien korelasi $r$ antar seluruh pasangan variabel dalam bentuk palet warna.
""",

    "ioai_05_preprocessing_pca.md": """# Praproses Data, Skalasi, & Reduksi Dimensi PCA

Kualitas data menentukan batas atas performa model machine learning (*Garbage In, Garbage Out*). Tahap praproses data mempersiapkan fitur numerik dan kategorikal ke format representasi yang stabil untuk komputasi numerik.

---

## 1. Penanganan Nilai Hilang (Missing Values)

- **Penghapusan (Dropping)**: Menghapus baris/kolom dengan nilai hilang jika proporsinya $< 5\\%$ atau tidak informatif.
- **Imputasi Statistik**: Mengisi nilai hilang dengan Mean (untuk data terdistribusi normal) atau Median (untuk data condong / banyak outlier).
- **Imputasi Berbasis Model**: Menggunakan KNN Imputer atau regresi iteratif.

---

## 2. Normalisasi & Standarisasi Fitur

### Standarisasi Z-Score
Mentransformasi fitur sehingga memiliki $\\mu = 0$ dan $\\sigma = 1$:
$$z = \\frac{x - \\mu}{\\sigma}$$
Wajib digunakan untuk algoritma berbasis jarak (KNN, K-Means) dan model berbasis gradient descent (Logistic Regression, Neural Networks).

### Min-Max Normalization (Rescaling)
Memetakan nilai fitur ke dalam rentang tertutup $[0, 1]$:
$$x_{\\text{norm}} = \\frac{x - x_{\\min}}{x_{\\max} - x_{\\min}}$$

---

## 3. Reduksi Dimensi dengan PCA (Principal Component Analysis)

Principal Component Analysis (PCA) adalah teknik reduksi dimensi linear tanpa supervisi (*unsupervised*) yang memproyeksikan data ke arah varians maksimum.

### Langkah Matematis PCA:
1. **Pusatkan Data**: Kurangkan setiap fitur dengan rata-ratanya: $\\mathbf{X}_{\\text{centered}} = \\mathbf{X} - \\bar{\\mathbf{X}}$.
2. **Hitung Matriks Kovarians**:
   $$\\mathbf{C} = \\frac{1}{n-1} \\mathbf{X}^T \\mathbf{X}$$
3. **Dekomposisi Eigen**:
   $$\\mathbf{C} \\mathbf{v}_i = \\lambda_i \\mathbf{v}_i$$
   Di mana $\\lambda_i$ mengukur besarnya varians yang dijelaskan oleh komponen utama $\\mathbf{v}_i$.
4. **Proyeksikan Data**: Pilih $k$ eigenvector dengan eigenvalue terbesar $\\mathbf{W} = [\\mathbf{v}_1, \\dots, \\mathbf{v}_k]$:
   $$\\mathbf{Z} = \\mathbf{X} \\mathbf{W}$$
""",

    "ioai_06_classification_eval.md": """# Model Klasifikasi & Metrik Evaluasi Komprehensif

Klasifikasi adalah tugas *supervised learning* di mana model memetakan vektor fitur input $\\mathbf{x}$ ke salah satu kelas diskrit $y \\in \\{0, 1, \\dots, C-1\\}$.

---

## 1. Algoritma Klasifikasi Utama

### A. K-Nearest Neighbors (KNN)
Algoritma *instance-based non-parametrik*. Memprediksi label sampel baru berdasarkan mayoritas voting dari $k$ tetangga terdekat menggunakan jarak Euclidean:
$$d(\\mathbf{p}, \\mathbf{q}) = \\sqrt{\\sum_{i=1}^d (p_i - q_i)^2}$$

### B. Regresi Logistik
Model linier probabilistik yang memetakan kombinasi linier fitur ke rentang probabilitas $(0, 1)$ menggunakan fungsi logistik Sigmoid:
$$P(y=1|\\mathbf{x}) = \\sigma(\\mathbf{w}^T \\mathbf{x} + b) = \\frac{1}{1 + e^{-(\\mathbf{w}^T \\mathbf{x} + b)}}$$
Dioptimalkan dengan meminimalkan fungsi **Binary Cross-Entropy Loss**:
$$\\mathcal{L}(\\mathbf{w}) = -\\frac{1}{N} \\sum_{i=1}^N \\left[ y_i \\log(\\hat{y}_i) + (1 - y_i) \\log(1 - \\hat{y}_i) \\right]$$

### C. Decision Tree (Pohon Keputusan)
Membagi ruang fitur secara rekursif berdasarkan kriteria pemisahan kemurnian node:
- **Gini Impurity**: $I_G = 1 - \\sum_{i=1}^C p_i^2$
- **Entropi Informasi**: $H = -\\sum_{i=1}^C p_i \\log_2(p_i)$

---

## 2. Confusion Matrix & Metrik Evaluasi

$$\\begin{array}{c|cc}
& \\text{Prediksi Positif} & \\text{Prediksi Negatif} \\\\
\\hline
\\text{Aktual Positif} & \\text{TP (True Positive)} & \\text{FN (False Negative)} \\\\
\\text{Aktual Negatif} & \\text{FP (False Positive)} & \\text{TN (True Negative)}
\\end{array}$$

- **Accuracy**: $\\frac{\\text{TP} + \\text{TN}}{\\text{TP} + \\text{TN} + \\text{FP} + \\text{FN}}$
- **Precision**: $\\frac{\\text{TP}}{\\text{TP} + \\text{FP}}$ (Kemampuan menghindari salah tuduh positif)
- **Recall / Sensitivity**: $\\frac{\\text{TP}}{\\text{TP} + \\text{FN}}$ (Kemampuan menangkap seluruh kasus positif)
- **F1-Score**: Rata-rata harmonik antara presisi dan recall:
  $$F_1 = 2 \\times \\frac{\\text{Precision} \\times \\text{Recall}}{\\text{Precision} + \\text{Recall}}$$
- **ROC-AUC**: Luas area di bawah kurva *Receiver Operating Characteristic* (True Positive Rate vs False Positive Rate).
""",

    "ioai_07_regression_regularization.md": """# Regresi Linier Teratur: Ridge, LASSO, & Elastic Net

Regresi linier memprediksi variabel target kontinu $y \\in \\mathbb{R}$. Namun pada dataset nyata berdimensi tinggi atau dengan korelasi antarkolom yang kuat (multikolinearitas), regresi linier biasa (Ordinary Least Squares - OLS) rentan mengalami *overfitting* dan memiliki varians bobot yang ekstrem.

---

## 1. Ordinary Least Squares (OLS)

Fungsi loss kuadrat terkecil murni:
$$\\mathcal{L}_{\\text{OLS}}(\\mathbf{w}) = \\frac{1}{2n} \\sum_{i=1}^n (y_i - \\mathbf{w}^T \\mathbf{x}_i)^2 = \\frac{1}{2n} \\|\\mathbf{y} - \\mathbf{X}\\mathbf{w}\\|^2_2$$

---

## 2. Regularisasi Ridge ($L_2$)

Menambahkan penalti kuadrat magnitudo bobot ke dalam fungsi loss:
$$\\mathcal{L}_{\\text{Ridge}}(\\mathbf{w}) = \\frac{1}{2n} \\|\\mathbf{y} - \\mathbf{X}\\mathbf{w}\\|^2_2 + \\lambda \\sum_{j=1}^d w_j^2$$
- Menyusutkan nilai bobot mendekati nol (*weight decay*), tetapi tidak pernah menjadikannya nol secara tepat.
- Menstabilkan invers matriks ketika ada multikolinearitas: $\\mathbf{w}^* = (\\mathbf{X}^T \\mathbf{X} + \\lambda \\mathbf{I})^{-1} \\mathbf{X}^T \\mathbf{y}$.

---

## 3. Regularisasi LASSO ($L_1$)

Menambahkan penalti nilai mutlak magnitudo bobot:
$$\\mathcal{L}_{\\text{LASSO}}(\\mathbf{w}) = \\frac{1}{2n} \\|\\mathbf{y} - \\mathbf{X}\\mathbf{w}\\|^2_2 + \\lambda \\sum_{j=1}^d |w_j|$$
- **Sparsity & Feature Selection**: Karena kontur geometri norma $L_1$ berbentuk wajik bersudut lancip pada sumbu koordinat, LASSO mampu memaksa bobot fitur yang tidak relevan menjadi **tepat nol**.
- Menghasilkan model yang lebih sederhana dan mudah diinterpretasikan.

---

## 4. Elastic Net

Kombinasi berbobot antara penalti $L_1$ dan $L_2$:
$$\\mathcal{L}_{\\text{Elastic}}(\\mathbf{w}) = \\mathcal{L}_{\\text{OLS}} + \\lambda_1 \\|\\mathbf{w}\\|_1 + \\lambda_2 \\|\\mathbf{w}\\|^2_2$$
Sangat efektif ketika terdapat sekelompok variabel yang saling berkorelasi tinggi (*grouped variable selection*).
""",

    "ioai_08_clustering_unsupervised.md": """# Unsupervised Learning: Algoritma Clustering

*Clustering* adalah metode pembelajaran tanpa supervisi (*unsupervised learning*) untuk mengelompokkan data yang tidak memiliki label ke dalam klaster-klaster alami berdasarkan kesamaan fitur (*similarity*).

---

## 1. Algoritma K-Means

Mengelompokkan $N$ sampel data ke dalam $K$ klaster yang telah ditentukan sebelumnya.

### Objektif Matematis (Inersia / WCSS):
Meminimalkan *Within-Cluster Sum of Squares*:
$$J = \\sum_{k=1}^K \\sum_{\\mathbf{x}_i \\in C_k} \\|\\mathbf{x}_i - \\boldsymbol{\\mu}_k\\|^2$$
Di mana $\\boldsymbol{\\mu}_k$ adalah titik pusat (*centroid*) dari klaster $C_k$.

### Algoritma Lloyd:
1. Inisialisasi $K$ centroid secara acak (atau menggunakan inisialisasi cerdas **K-Means++**).
2. **Tahap Assignment**: Setiap titik data dialokasikan ke centroid terdekat berdasarkan jarak Euclidean.
3. **Tahap Update**: Hitung ulang posisi centroid sebagai rata-rata dari seluruh anggota klaster tersebut:
   $$\\boldsymbol{\\mu}_k = \\frac{1}{|C_k|} \\sum_{\\mathbf{x} \\in C_k} \\mathbf{x}$$
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
$$s(i) = \\frac{b(i) - a(i)}{\\max(a(i), b(i))}$$
- $a(i)$: Rata-rata jarak titik $i$ ke seluruh titik lain dalam klaster yang sama.
- $b(i)$: Rata-rata jarak titik $i$ ke titik dalam klaster terdekat berikutnya.
- Nilai $s(i) \\in [-1, 1]$. Nilai mendekati $+1$ mengindikasikan klaster terpisah dengan sangat baik dan padat.
""",

    "ioai_09_perceptron_activation.md": """# Perceptron & Fungsi Aktivasi Non-Linear

Jaringan saraf tiruan (*Artificial Neural Networks*) terinspirasi dari struktur neuron biologis di otak manusia. Unit pemrosesan paling mendasar adalah **Perceptron**, yang kemudian dikembangkan dengan berbagai fungsi aktivasi non-linear.

---

## 1. Struktur Matematika Perceptron

Perceptron menerima input vektor $\\mathbf{x} = [x_1, \\dots, x_d]^T$, mengalikannya dengan bobot $\\mathbf{w} = [w_1, \\dots, w_d]^T$, menambahkan bias $b$, lalu meneruskannya ke fungsi aktivasi:
$$z = \\sum_{i=1}^d w_i x_i + b = \\mathbf{w}^T \\mathbf{x} + b$$
$$\\hat{y} = g(z)$$

### Masalah Linear Separability (XOR Problem)
Perceptron tunggal dengan aktivasi step function hanya mampu menyelesaikan masalah yang dapat dipisahkan secara linier (*linearly separable*) seperti fungsi AND dan OR. Perceptron tunggal terbukti gagal memecahkan fungsi XOR. Solusinya adalah menyusun beberapa lapisan perceptron (**Multilayer Perceptron**) dengan fungsi aktivasi non-linear.

---

## 2. Spektrum Fungsi Aktivasi Non-Linear

### A. Sigmoid (Logistik)
$$\\sigma(z) = \\frac{1}{1 + e^{-z}}, \\quad \\sigma'(z) = \\sigma(z)(1 - \\sigma(z))$$
- Output berada pada rentang $(0, 1)$, ideal untuk probabilitas biner.
- Kekurangan: Rentan terhadap masalah *vanishing gradient* pada nilai $|z|$ besar, dan output tidak terpusat di nol (*zero-centered*).

### B. Tangen Hiperbolik (Tanh)
$$\\tanh(z) = \\frac{e^z - e^{-z}}{e^z + e^{-z}}, \\quad \\tanh'(z) = 1 - \\tanh^2(z)$$
- Output berada pada rentang $(-1, 1)$ dan terpusat pada nol (*zero-centered*).

### C. ReLU (Rectified Linear Unit)
$$\\text{ReLU}(z) = \\max(0, z), \\quad \\text{ReLU}'(z) = \\begin{cases} 1 & \\text{jika } z > 0 \\\\ 0 & \\text{jika } z \\le 0 \\end{cases}$$
- Paling populer dalam deep learning modern karena komputasinya sangat cepat dan tidak mengalami saturasi gradien pada domain positif ($z > 0$).
- Varian: **Leaky ReLU** ($\\max(0.01z, z)$) untuk mencegah neuron mati (*dying ReLU problem*).

### D. Softmax (Klasifikasi Multi-Kelas)
Menormalisasi vektor skor logit $\\mathbf{z}$ menjadi distribusi probabilitas:
$$\\text{Softmax}(z_i) = \\frac{e^{z_i}}{\\sum_{j=1}^C e^{z_j}}$$
""",

    "ioai_10_backprop_optimizers.md": """# Multilayer Perceptron, Backpropagation, & Optimizer

Multilayer Perceptron (MLP) adalah jaringan saraf tiruan berarah (*feedforward neural network*) yang terdiri atas satu lapisan input, satu atau lebih lapisan tersembunyi (*hidden layers*), dan satu lapisan output.

---

## 1. Algoritma Backpropagation & Aturan Rantai

Backpropagation adalah algoritma cerdas untuk menghitung turunan parsial dari fungsi loss $\\mathcal{L}$ terhadap setiap bobot parameter $w_{ij}$ dalam jaringan menggunakan aturan rantai kalkulus (*chain rule*).

### Formulasi Turunan Rantai:
Untuk bobot $w_{jk}$ yang menghubungkan neuron $j$ ke neuron $k$:
$$\\frac{\\partial \\mathcal{L}}{\\partial w_{jk}} = \\frac{\\partial \\mathcal{L}}{\\partial a_k} \\cdot \\frac{\\partial a_k}{\\partial z_k} \\cdot \\frac{\\partial z_k}{\\partial w_{jk}} = \\delta_k \\cdot a_j$$
Di mana:
- $z_k = \\sum_j w_{jk} a_j + b_k$ adalah kombinasi linear.
- $\\delta_k = \\frac{\\partial \\mathcal{L}}{\\partial z_k}$ adalah sinyal error yang dipropagasikan mundur dari lapisan output menuju lapisan awal.

---

## 2. Algoritma Optimasi Modern

### A. Stochastic Gradient Descent (SGD) dengan Momentum
Menyimpan memori kecepatan arah langkah sebelumnya untuk meredam osilasi:
$$\\mathbf{v}_t = \\beta \\mathbf{v}_{t-1} + (1 - \\beta) \\nabla_\\theta \\mathcal{L}$$
$$\\theta_t = \\theta_{t-1} - \\alpha \\mathbf{v}_t$$

### B. RMSprop (Root Mean Square Propagation)
Menyesuaikan laju pembaruan per-parameter dengan membagi gradien terhadap rata-rata bergerak kuadrat gradien:
$$\\mathbf{s}_t = \\beta \\mathbf{s}_{t-1} + (1 - \\beta) (\\nabla_\\theta \\mathcal{L})^2$$
$$\\theta_t = \\theta_{t-1} - \\frac{\\alpha}{\\sqrt{\\mathbf{s}_t} + \\epsilon} \\nabla_\\theta \\mathcal{L}$$

### C. Adam (Adaptive Moment Estimation)
Menggabungkan keunggulan momentum (momen pertama) dan RMSprop (momen kedua) dengan koreksi bias:
$$\\hat{\\mathbf{m}}_t = \\frac{\\mathbf{m}_t}{1 - \\beta_1^t}, \\quad \\hat{\\mathbf{v}}_t = \\frac{\\mathbf{v}_t}{1 - \\beta_2^t}$$
$$\\theta_t = \\theta_{t-1} - \\frac{\\alpha}{\\sqrt{\\hat{\\mathbf{v}}_t} + \\epsilon} \\hat{\\mathbf{m}}_t$$
Adam adalah optimizer standar paling andal untuk melatih model deep learning kontemporer.
""",

    "ioai_11_pytorch_deep_learning.md": """# Framework PyTorch, Autograd, & Pelatihan Model

PyTorch adalah kerangka kerja (*framework*) deep learning paling dominan di dunia riset AI dan kompetisi kompetitif karena sifat graf komputasi dinamisnya (*define-by-run*) dan integrasi perangkat keras CUDA yang mulus.

---

## 1. Komputasi Tensor & Mesin Autograd

Tensor PyTorch mirip dengan array NumPy, namun dilengkapi kemampuan komputasi pada GPU NVIDIA dan pelacakan gradien otomatis (*automatic differentiation*):

```python
import torch

# Membuat tensor dengan pelacakan gradien aktif
x = torch.tensor([2.0, 3.0], requires_grad=True)
y = x[0]**2 + 3 * x[1]**3

# Hitung gradien parsial dy/dx
y.backward()
print("Gradien x:", x.grad)  # [4.0, 81.0]
```

---

## 2. Struktur Modul Jaringan (`torch.nn.Module`)

Setiap arsitektur di PyTorch didefinisikan sebagai subclass dari `nn.Module`:

```python
import torch
import torch.nn as nn

class MultiLayerPerceptron(nn.Module):
    def __init__(self, in_features: int, hidden: int, num_classes: int):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(in_features, hidden),
            nn.BatchNorm1d(hidden),
            nn.ReLU(),
            nn.Dropout(p=0.2),
            nn.Linear(hidden, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)
```

---

## 3. Alur Loop Pelatihan Standar (Training Loop)

Setiap iterasi pelatihan di PyTorch mengikuti pola 5 langkah wajib:

```python
# 1. Bersihkan gradien akumulasi dari iterasi sebelumnya
optimizer.zero_grad()

# 2. Forward pass: hitung prediksi model
outputs = model(inputs)

# 3. Hitung nilai loss fungsi objektif
loss = criterion(outputs, targets)

# 4. Backward pass: hitung turunan gradien otomatis
loss.backward()

# 5. Optimizer step: perbarui bobot parameter
optimizer.step()
```
""",

    "ioai_12_image_fundamentals.md": """# Fondasi Citra Digital & Filter Konvolusi 2D

Penglihatan Komputer (*Computer Vision*) adalah disiplin ilmu AI yang memungkinkan mesin memahami, mengekstrak informasi, dan mengambil keputusan dari gambar visual dan video dunia nyata.

---

## 1. Representasi Citra Digital

Secara komputasi, citra digital adalah matriks numerik berdimensi 2D atau tensor 3D:
- **Citra Grayscale**: Matriks 2D dengan dimensi $H \\times W$ di mana setiap nilai piksel merepresentasikan intensitas cahaya pada rentang $[0, 255]$ ($0 = \\text{hitam}$, $255 = \\text{putih}$).
- **Citra Warna RGB**: Tensor 3D berukuran $H \\times W \\times 3$, memuat kanal Red (Merah), Green (Hijau), dan Blue (Biru).

---

## 2. Operasi Konvolusi Citra 2D

Konvolusi citra 2D adalah proses menggeser sebuah matriks kecil berukuran $k \\times k$ (disebut **kernel** atau **filter**) di atas seluruh permukaan citra untuk menghasilkan *feature map* baru.

### Formula Konvolusi Diskrit:
$$S(i, j) = (I * K)(i, j) = \\sum_m \\sum_n I(i - m, j - n) K(m, n)$$

### Contoh Filter Klasik:
1. **Gaussian Blur Filter**: Mengaburkan citra dan mereduksi noise frekuensi tinggi.
2. **Sobel Edge Detector**: Menghitung gradien intensitas spasial untuk mendeteksi tepi garis horizontal dan vertikal:
   $$K_{\\text{Sobel}_x} = \\begin{bmatrix} -1 & 0 & 1 \\\\ -2 & 0 & 2 \\\\ -1 & 0 & 1 \\end{bmatrix}, \\quad K_{\\text{Sobel}_y} = \\begin{bmatrix} -1 & -2 & -1 \\\\ 0 & 0 & 0 \\\\ 1 & 2 & 1 \\end{bmatrix}$$
3. **Laplacian Filter**: Turunan kedua untuk mendeteksi perubahan kontras tajam dari segala arah.
""",

    "ioai_13_cnn_architectures.md": """# Convolutional Neural Networks (CNN) & ResNet

Jaringan saraf konvolusional (CNN) dirancang khusus untuk memproses data berstruktur kisi spasial seperti gambar, memanfaatkan dua prinsip kunci: **bobot bersama (*parameter sharing*)** dan **konektivitas lokal (*local receptive fields*)**.

---

## 1. Komponen Utama Lapisan CNN

### A. Lapisan Konvolusi (Convolutional Layer)
Menerapkan bank filter $3 \\times 3$ atau $5 \\times 5$ untuk mengekstrak fitur visual lokal (garis tepi, tekstur, pola).
- **Stride ($s$)**: Jumlah langkah pergeseran filter piksel demi piksel.
- **Padding ($p$)**: Penambahan nilai 0 di sekeliling batas tepi citra untuk mempertahankan ukuran spasial (*Same Padding*).

### Formula Dimensi Spasial Output:
$$W_{\\text{out}} = \\left\\lfloor \\frac{W_{\\text{in}} - K + 2p}{s} \\right\\rfloor + 1$$

### B. Lapisan Pooling (Max / Average Pooling)
Mereduksi dimensi spasial (*downsampling*) untuk meningkatkan ketahanan model terhadap pergeseran posisi (*spatial translation invariance*) serta menghemat beban komputasi memori:
$$\\text{MaxPool}_{2 \\times 2}: \\quad (H, W) \\longrightarrow \\left(\\frac{H}{2}, \\frac{W}{2}\\right)$$

---

## 2. Arsitektur ResNet (Residual Network)

Sebelum adanya ResNet, jaringan CNN yang sangat dalam ($> 20$ layer) mengalami fenomena *degradasi*, di mana akurasi pelatihan justru menurun karena gradien lenyap (*vanishing gradient*).

### Blok Residual (Skip Connection):
ResNet memperkenalkan koneksi pintas (*shortcut/skip connection*) yang melewatkan input $\\mathbf{x}$ secara langsung ke output:
$$\\mathbf{y} = \\mathcal{F}(\\mathbf{x}, \\{W_i\\}) + \\mathbf{x}$$
Dengan residual learning, jaringan hanya perlu mempelajari fungsi selisih $\\mathcal{F}(\\mathbf{x}) = \\mathbf{y} - \\mathbf{x}$. Jika fungsi identitas optimal, bobot $\\mathcal{F}$ dapat dengan mudah didegradasi ke nol tanpa merusak aliran gradien saat backpropagation.
""",

    "ioai_14_object_detection_segmentation.md": """# Deteksi Objek (YOLO) & Segmentasi Citra (U-Net)

Tugas computer vision tingkat lanjut melampaui sekadar klasifikasi label gambar tunggal dengan menemukan lokasi objek secara presisi (*detection*) dan mengidentifikasi batas piksel setiap benda (*segmentation*).

---

## 1. Deteksi Objek (Object Detection)

Tujuan: Memprediksi kelas objek sekaligus koordinat kotak pembatas (*Bounding Box*):
$$\\text{BBox} = [x_{\\text{center}}, y_{\\text{center}}, \\text{width}, \\text{height}]$$

### A. Metrik Intersection over Union (IoU)
Mengukur tingkat tumpang tindih antara kotak prediksi ($B_{\\text{pred}}$) dan kotak sebenarnya ($B_{\\text{gt}}$):
$$\\text{IoU} = \\frac{\\text{Area}(B_{\\text{pred}} \\cap B_{\\text{gt}})}{\\text{Area}(B_{\\text{pred}} \\cup B_{\\text{gt}})}$$
Prediksi dianggap tepat jika $\\text{IoU} \\ge 0.5$ (atau threshold yang ditentukan).

### B. Non-Maximum Suppression (NMS)
Algoritma eliminasi kotak redundan: Dari sekian banyak deteksi yang tumpang tindih pada objek yang sama, NMS mempertahankan kotak dengan skor kepercayaan tertinggi dan menghapus kotak lain yang memiliki $\\text{IoU} > \\text{threshold}$.

### C. Paradigma Arsitektur:
- **Two-Stage Detectors (R-CNN, Faster R-CNN)**: Menghasilkan Region Proposals terlebih dahulu sebelum klasifikasi (akurasi tinggi, kecepatan sedang).
- **Single-Stage Detectors (YOLO, SSD)**: Memprediksi kelas dan bounding box langsung dalam satu kali forward pass terintegrasi (kecepatan *real-time* 60+ FPS).

---

## 2. Segmentasi Citra (Image Segmentation)

- **Semantic Segmentation**: Mengklasifikasikan setiap piksel ke dalam kelas label tanpa membedakan antar-individu (misal: semua orang diwarnai merah).
- **Instance Segmentation**: Mengklasifikasikan setiap piksel sekaligus membedakan entitas individu yang berbeda (orang A biru, orang B kuning).

### Arsitektur U-Net
U-Net adalah jaringan berbentuk huruf "U" dengan arsitektur **Encoder-Decoder**:
1. **Contracting Path (Encoder)**: Konvolusi berulang dan pooling untuk menangkap konteks semantik global.
2. **Expansive Path (Decoder)**: Up-convolution (transposed convolution) untuk merekonstruksi resolusi spasial tinggi.
3. **Skip Connections**: Menggabungkan fitur beresolusi tinggi langsung dari encoder ke decoder untuk menjaga detail tepi objek.
""",

    "ioai_15_text_processing_embeddings.md": """# Praproses Teks, TF-IDF, & Word Embeddings

Pemrosesan Bahasa Alami (*Natural Language Processing* / NLP) menjembatani komunikasi bahasa manusia dan pemahaman komputasi mesin. Karena komputer hanya memahami angka dan matriks, teks harus diubah menjadi representasi vektor numerik.

---

## 1. Alur Praproses Teks Standar

1. **Pembersihan Teks**: Menghapus tanda baca, tag HTML, angka yang tidak relevan, dan konversi ke huruf kecil (*case folding*).
2. **Tokenisasi**: Membagi paragraf atau kalimat menjadi unit-unit kata atau subkata (*tokens*).
3. **Penghapusan Stopwords**: Menyaring kata-kata umum dengan informasi rendah (seperti "dan", "di", "yang").
4. **Lemmatisasi vs Stemming**: Mengembalikan kata ke bentuk dasarnya (misal: "berlari" $\\rightarrow$ "lari").

---

## 2. Representasi Klasik: Bag-of-Words & TF-IDF

### Term Frequency - Inverse Document Frequency (TF-IDF)
Mengukur seberapa penting sebuah kata $t$ dalam dokumen $d$ relatif terhadap seluruh korpus koleksi dokumen $D$:
$$\\text{TF-IDF}(t, d, D) = \\text{TF}(t, d) \\times \\text{IDF}(t, D)$$
$$\\text{IDF}(t, D) = \\log\\left( \\frac{1 + |D|}{1 + |\\{d \\in D : t \\in d\\}|} \\right) + 1$$
Kata yang sering muncul di seluruh dokumen korpus akan diberi bobot penalti rendah, sedangkan kata unik yang sering muncul dalam satu dokumen akan mendapat bobot tinggi.

---

## 3. Dense Word Embeddings: Word2Vec & GloVe

Model TF-IDF menghasilkan representasi vektor yang sangat panjang, jarang (*sparse*), dan tidak menangkap makna semantik (jarak antar kata sama saja). Solusinya adalah **Dense Word Embeddings** di mana setiap kata dipetakan ke vektor padat berdimensi rendah ($d \\approx 100 - 300$).

### A. Word2Vec
Berdasarkan hipotesis distribusi: *"kata-kata yang muncul dalam konteks yang mirip memiliki makna yang mirip"*.
- **Continuous Bag of Words (CBOW)**: Memprediksi kata target berdasarkan kata-kata konteks di sekitarnya.
- **Skip-Gram**: Memprediksi kata-kata konteks di sekelilingnya berdasarkan kata target.

### B. Properti Analogi Semantik
Vektor embedding dapat melakukan operasi aritmatika analogi makna:
$$\\vec{v}_{\\text{King}} - \\vec{v}_{\\text{Man}} + \\vec{v}_{\\text{Woman}} \\approx \\vec{v}_{\\text{Queen}}$$
Kedekatan makna diukur menggunakan **Cosine Similarity**:
$$\\cos(\\theta) = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\|\\mathbf{u}\\| \\|\\mathbf{v}\\|}$$
""",

    "ioai_16_rnn_lstm_nlp.md": """# Model Sekuensial: RNN, LSTM, & Analisis Sentimen

Teks adalah data sekuensial alami di mana makna sebuah kata sangat bergantung pada urutan kata-kata sebelumnya. Jaringan neural standar (MLP) tidak memiliki memori urutan dan mensyaratkan input berukuran tetap, sehingga dibutuhkan arsitektur jaringan saraf berulang (*Recurrent Neural Networks*).

---

## 1. Arsitektur Recurrent Neural Network (RNN)

RNN memproses token urutan satu per satu sambil mempertahankan status tersembunyi (*hidden state* $h_t$) sebagai representasi memori:
$$h_t = \\tanh(W_{hh} h_{t-1} + W_{xh} x_t + b_h)$$
$$y_t = \\text{softmax}(W_{hy} h_t + b_y)$$

### Kelemahan RNN Klasik:
Saat deret teks cukup panjang ($> 15$ kata), perkalian matriks berulang dalam *Backpropagation Through Time* (BPTT) menyebabkan gradien menyusut secara eksponensial (**Vanishing Gradient**) atau meledak (**Exploding Gradient**), sehingga RNN lupa konteks awal kalimat.

---

## 2. Arsitektur Long Short-Term Memory (LSTM)

LSTM mengatasi masalah gradien lenyap dengan memperkenalkan **Cell State ($C_t$)** sebagai jalan tol informasi yang diatur oleh tiga mekanisme pintu (*gates*):

1. **Forget Gate ($f_t$)**: Menentukan informasi apa dari status sel lama yang harus dibuang:
   $$f_t = \\sigma(W_f [h_{t-1}, x_t] + b_f)$$
2. **Input Gate ($i_t$)**: Menentukan informasi baru apa yang akan disimpan ke dalam status sel:
   $$i_t = \\sigma(W_i [h_{t-1}, x_t] + b_i)$$
   $$\\tilde{C}_t = \\tanh(W_c [h_{t-1}, x_t] + b_c)$$
   $$C_t = f_t \\odot C_{t-1} + i_t \\odot \\tilde{C}_t$$
3. **Output Gate ($o_t$)**: Menentukan hidden state output berdasarkan status sel yang telah diperbarui:
   $$o_t = \\sigma(W_o [h_{t-1}, x_t] + b_o)$$
   $$h_t = o_t \\odot \\tanh(C_t)$$

---

## 3. Implementasi Analisis Sentimen PyTorch

```python
import torch
import torch.nn as nn

class SentimentLSTM(nn.Module):
    def __init__(self, vocab_size: int, embed_dim: int, hidden_dim: int, num_classes: int = 2):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True)
        self.fc = nn.Linear(hidden_dim, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        embedded = self.embedding(x)
        out, (hn, cn) = self.lstm(embedded)
        # Gunakan status tersembunyi terakhir untuk klasifikasi
        return self.fc(hn[-1])
```
""",

    "ioai_17_transformers_llm.md": """# Arsitektur Transformer & Fondasi Model Bahasa (LLM)

Diperkenalkan dalam makalah legendaris *"Attention Is All You Need"* (Vaswani et al., 2017), arsitektur **Transformer** merevolusi seluruh lanskap kecerdasan buatan dengan membuang ketergantungan rekursif RNN dan menggantikannya sepenuhnya dengan mekanisme **Self-Attention**.

---

## 1. Mekanisme Scaled Dot-Product Attention

Perhatian mandiri (*Self-Attention*) memungkinkan setiap token kata dalam kalimat memperhatikan dan menimbang hubungan dengan seluruh kata lain secara langsung, tanpa memandang jarak posisi dalam teks.

Setiap token diproyeksikan menjadi tiga vektor:
- **Query ($Q$)**: *"Apa yang sedang saya cari?"*
- **Key ($K$)**: *"Karakteristik atau label apa yang saya miliki?"*
- **Value ($V$)**: *"Informasi apa yang saya simpan?"*

### Rumus Matematis Self-Attention:
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left( \\frac{QK^T}{\\sqrt{d_k}} \\right) V$$
Faktor $\\frac{1}{\\sqrt{d_k}}$ berfungsi menjaga kestabilan magnitudo dot product agar gradien softmax tidak mengalami saturasi pada dimensi tinggi.

---

## 2. Multi-Head Attention & Positional Encoding

### Multi-Head Attention
Memproyeksikan $Q, K, V$ ke dalam $h$ ruang representasi yang berbeda secara paralel, memungkinkan model memperhatikan aspek hubungan sintaksis dan semantik yang beragam secara simultan:
$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) W^O$$

### Positional Encoding
Karena transformer memproses seluruh token kalimat sekaligus (*parallel processing*), urutan kata disuntikkan secara eksplisit menggunakan fungsi gelombang sinusoidal:
$$PE_{(pos, 2i)} = \\sin\\left( \\frac{pos}{10000^{2i / d_{\\text{model}}}} \\right)$$
$$PE_{(pos, 2i+1)} = \\cos\\left( \\frac{pos}{10000^{2i / d_{\\text{model}}}} \\right)$$

---

## 3. Ekosistem Large Language Models (LLM)

Arsitektur Transformer menjadi fondasi utama seluruh model generasi teks modern:
1. **Encoder-Only (BERT)**: Sangat andal untuk klasifikasi teks, penamaan entitas (NER), dan ekstraksi informasi.
2. **Decoder-Only (GPT, Llama, Mistral)**: Model kausal *autoregressive* yang memprediksi kata berikutnya secara berturut-turut untuk generasi teks alami dan penalaran kompleks.
3. **Encoder-Decoder (T5, BART)**: Dirancang untuk tugas terjemahan bahasa (*machine translation*) dan peringkasan teks (*summarization*).
"""
}

# 1. Write all lesson markdown files
print("Writing markdown lessons to:", MODULES_DIR)
for filename, content in lessons_content.items():
    target = MODULES_DIR / filename
    target.write_text(content.strip(), encoding="utf-8")
    print(f"  [OK] Wrote {filename}")

# 2. Update curriculum manifest JSON
with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
    manifest = json.load(f)

# Keep the original 5 modules (filter or keep)
orig_modules = [m for m in manifest if not m.get("id", "").startswith("module_ioai_")]
print(f"Preserved {len(orig_modules)} original foundation modules.")

# Define the 5 new Pelatnas IOAI modules
ioai_modules = [
    {
        "id": "module_ioai_foundations",
        "title": "Modul 6: [IOAI] Fondasi AI: Matematika & Statistika",
        "description": "Aljabar linear (vektor, matriks, SVD), kalkulus multivariat, teori optimasi gradient descent, teori peluang, dan analisis data eksploratif (EDA).",
        "level": "Dasar-Menengah",
        "estimated_hours": 16,
        "lessons": [
            {
                "id": "ioai_01_linear_algebra",
                "title": "6.1 Aljabar Linear: Vektor, Matriks, & SVD",
                "type": "THEORY",
                "content_path": "modules/ioai_01_linear_algebra.md",
                "video_url": "https://www.youtube.com/embed/fNk_zzaMoSs",
                "quiz": {
                    "question": "Jika sebuah matriks persegi $\\mathbf{A} \\in \\mathbb{R}^{n \\times n}$ memiliki determinan $\\det(\\mathbf{A}) = 0$, apa implikasi matematisnya?",
                    "options": [
                        "Matriks $\\mathbf{A}$ adalah singular dan tidak memiliki matriks invers $\\mathbf{A}^{-1}$",
                        "Seluruh eigenvalue dari $\\mathbf{A}$ bernilai 1",
                        "Matriks $\\mathbf{A}$ memiliki full rank $n$",
                        "Perkalian $\\mathbf{A}\\mathbf{x}$ selalu menghasilkan vektor nol untuk setiap $\\mathbf{x}$"
                    ],
                    "correct_index": 0,
                    "explanation": "Matriks dengan determinan nol adalah singular (tidak memiliki rank penuh), sehingga kolom-kolomnya saling bergantung linear dan tidak dapat diinverskan."
                }
            },
            {
                "id": "ioai_02_calculus_optimization",
                "title": "6.2 Kalkulus Multivariat & Teori Optimasi Gradient Descent",
                "type": "CODING",
                "content_path": "modules/ioai_02_calculus_optimization.md",
                "video_url": "https://www.youtube.com/embed/IHZwWFHWa-w",
                "starter_code": "def gradient_descent_step(w: float, grad: float, lr: float) -> float:\n    # Lakukan 1 langkah pembaruan bobot w dengan gradient descent\n    pass\n",
                "test_assertions": "assert round(gradient_descent_step(5.0, 2.0, 0.1), 4) == 4.8\nassert round(gradient_descent_step(10.0, -4.0, 0.05), 4) == 10.2\nprint('Gradient descent step passed!')"
            },
            {
                "id": "ioai_03_stats_probability",
                "title": "6.3 Teori Peluang, Variabel Acak, & Teorema Bayes",
                "type": "THEORY",
                "content_path": "modules/ioai_03_stats_probability.md",
                "video_url": "https://www.youtube.com/embed/HZGCoVF3YvM",
                "quiz": {
                    "question": "Diberikan dua kejadian $A$ dan $B$. Berdasarkan Teorema Bayes, rumus probabilitas posterior $P(A|B)$ adalah:",
                    "options": [
                        "$\\frac{P(B|A) \\cdot P(A)}{P(B)}$",
                        "$\\frac{P(A|B) \\cdot P(B)}{P(A)}$",
                        "$P(A) \\cdot P(B) - P(A \\cap B)$",
                        "$\\frac{P(A \\cap B)}{P(A)}$"
                    ],
                    "correct_index": 0,
                    "explanation": "Teorema Bayes memformulasikan posterior $P(A|B)$ sebagai hasil perkalian antara likelihood $P(B|A)$ dan prior $P(A)$, dibagi dengan probabilitas bukti $P(B)$."
                }
            },
            {
                "id": "ioai_04_eda_python_tools",
                "title": "6.4 Analisis Data Eksploratif & Deteksi Outlier (IQR)",
                "type": "CODING",
                "content_path": "modules/ioai_04_eda_python_tools.md",
                "video_url": "https://www.youtube.com/embed/liv6eP0n_a0",
                "starter_code": "def detect_outliers_iqr(data: list[float]) -> list[float]:\n    # Kembalikan daftar nilai yang berada di luar batas [Q1 - 1.5*IQR, Q3 + 1.5*IQR]\n    # Diasumsikan data telah terurut\n    pass\n",
                "test_assertions": "d = [10.0, 12.0, 14.0, 15.0, 16.0, 18.0, 100.0]\n# Q1 = 12.0, Q3 = 18.0, IQR = 6.0, Upper threshold = 18 + 9 = 27.0\n# Outlier = [100.0]\nprint('EDA tests ready!')"
            }
        ]
    },
    {
        "id": "module_ioai_machine_learning",
        "title": "Modul 7: [IOAI] Machine Learning Terapan & Rekayasa Fitur",
        "description": "Praproses data, normalisasi Z-score/Min-Max, reduksi dimensi PCA, model klasifikasi (KNN, Regresi Logistik, Pohon Keputusan), regularisasi Ridge/LASSO, dan clustering K-Means.",
        "level": "Menengah",
        "estimated_hours": 20,
        "lessons": [
            {
                "id": "ioai_05_preprocessing_pca",
                "title": "7.1 Normalisasi Fitur & Reduksi Dimensi PCA",
                "type": "THEORY",
                "content_path": "modules/ioai_05_preprocessing_pca.md",
                "video_url": "https://www.youtube.com/embed/FgakZw6K1QQ",
                "quiz": {
                    "question": "Pada Principal Component Analysis (PCA), arah sumbu komponen utama pertama (PC1) bersesuaian dengan:",
                    "options": [
                        "Eigenvector dari matriks kovarians data yang memiliki eigenvalue terbesar",
                        "Vektor yang memiliki nilai rata-rata nol",
                        "Kolom data yang memiliki jumlah missing value paling sedikit",
                        "Eigenvector yang memiliki nilai singular terkecil"
                    ],
                    "correct_index": 0,
                    "explanation": "PC1 ditentukan oleh eigenvector yang bersesuaian dengan eigenvalue terbesar dari matriks kovarians, karena arah tersebut menangkap varians data paling maksimal."
                }
            },
            {
                "id": "ioai_06_classification_eval",
                "title": "7.2 Model Klasifikasi & Metrik Evaluasi (F1 & ROC-AUC)",
                "type": "CODING",
                "content_path": "modules/ioai_06_classification_eval.md",
                "video_url": "https://www.youtube.com/embed/wpQiEHYkB4w",
                "starter_code": "def compute_accuracy_precision(tp: int, fp: int, fn: int, tn: int) -> tuple[float, float]:\n    # Kembalikan tuple (accuracy, precision)\n    pass\n",
                "test_assertions": "acc, prec = compute_accuracy_precision(50, 10, 5, 35)\nassert round(acc, 4) == 0.85\nassert round(prec, 4) == 0.8333\nprint('Classification metrics verified!')"
            },
            {
                "id": "ioai_07_regression_regularization",
                "title": "7.3 Regresi Linier Teratur: Ridge (L2) vs LASSO (L1)",
                "type": "THEORY",
                "content_path": "modules/ioai_07_regression_regularization.md",
                "video_url": "https://www.youtube.com/embed/9lhyPdGZB7E",
                "quiz": {
                    "question": "Mengapa regularisasi LASSO (penalti norma $L_1$) dapat digunakan sebagai teknik seleksi fitur otomatis (feature selection)?",
                    "options": [
                        "Geometri sudut lancip pada norma $L_1$ mampu memaksa bobot fitur yang tidak relevan menjadi tepat nol",
                        "LASSO mengalikan bobot dengan konstanta pembagi bernilai tak hingga",
                        "LASSO hanya menerima fitur bertipe data biner 0 dan 1",
                        "LASSO secara otomatis menghapus kolom dataset sebelum proses fitting"
                    ],
                    "correct_index": 0,
                    "explanation": "Kontur penalti norma $L_1$ berbentuk wajik bersudut tajam pada sumbu koordinat, sehingga titik optimal sering bersinggungan langsung pada sumbu di mana beberapa bobot bernilai tepat $0$."
                }
            },
            {
                "id": "ioai_08_clustering_unsupervised",
                "title": "7.4 Algoritma Clustering K-Means & Koefisien Silhouette",
                "type": "THEORY",
                "content_path": "modules/ioai_08_clustering_unsupervised.md",
                "video_url": "https://www.youtube.com/embed/4b5d3muPQmA",
                "quiz": {
                    "question": "Berapa rentang nilai koefisien Silhouette $s(i)$ dalam evaluasi clustering, dan apa arti nilai yang mendekati $+1$?",
                    "options": [
                        "Rentang $[-1, 1]$; nilai $+1$ menandakan titik data sangat padat di klasternya dan terpisah jauh dari klaster lain",
                        "Rentang $[0, 100]$; nilai $100$ menandakan jumlah klaster telah optimal",
                        "Rentang $[0, 1]$; nilai $1$ menandakan centroid berada tepat di titik tengah koordinat",
                        "Rentang $[-\\infty, +\\infty]$; nilai positif menandakan clustering tanpa supervised label"
                    ],
                    "correct_index": 0,
                    "explanation": "Koefisien Silhouette bernilai antara $-1$ hingga $+1$. Nilai $+1$ menunjukkan objek terkelompok dengan sangat baik di dalam kelompoknya dan terpisah tegas dari kelompok lain."
                }
            }
        ]
    },
    {
        "id": "module_ioai_deep_learning",
        "title": "Modul 8: [IOAI] Jaringan Saraf Tiruan & Deep Learning",
        "description": "Arsitektur unit Perceptron, spektrum fungsi aktivasi non-linear, aturan rantai backpropagation, optimizer modern Adam, dan framework PyTorch.",
        "level": "Lanjutan",
        "estimated_hours": 24,
        "lessons": [
            {
                "id": "ioai_09_perceptron_activation",
                "title": "8.1 Dari Perceptron ke Aktivasi Non-Linear (Sigmoid, ReLU, Softmax)",
                "type": "THEORY",
                "content_path": "modules/ioai_09_perceptron_activation.md",
                "video_url": "https://www.youtube.com/embed/aircAruvnKk",
                "quiz": {
                    "question": "Mengapa fungsi aktivasi ReLU ($\\max(0, z)$) jauh lebih disukai dibandingkan Sigmoid untuk lapisan tersembunyi pada deep neural network?",
                    "options": [
                        "ReLU tidak mengalami saturasi gradien pada domain positif ($z > 0$), sehingga mencegah masalah vanishing gradient",
                        "ReLU selalu menghasilkan angka probabilitas antara 0 dan 1",
                        "ReLU membuat jaringan saraf tiruan bekerja linier murni",
                        "ReLU memiliki turunan matematis yang selalu bernilai 0 di segala domain"
                    ],
                    "correct_index": 0,
                    "explanation": "Pada domain positif ($z > 0$), turunan parsial ReLU konstan bernilai $1$, sehingga sinyal gradien dapat mengalir mundur melalui ratusan layer tanpa lenyap (no vanishing gradient)."
                }
            },
            {
                "id": "ioai_10_backprop_optimizers",
                "title": "8.2 Multilayer Perceptron, Backpropagation, & Optimizer Adam",
                "type": "THEORY",
                "content_path": "modules/ioai_10_backprop_optimizers.md",
                "video_url": "https://www.youtube.com/embed/Ilg3gGewQ5U",
                "quiz": {
                    "question": "Komponen utama yang membedakan optimizer Adam (Adaptive Moment Estimation) dari SGD biasa adalah:",
                    "options": [
                        "Menggabungkan momen pertama (momentum) dan momen kedua (rata-rata bergerak kuadrat gradien) dengan koreksi bias",
                        "Adam tidak membutuhkan perhitungan turunan gradien sama sekali",
                        "Adam hanya memperbarui bobot lapisan output terakhir",
                        "Adam menggunakan metode pencarian grid eksidental"
                    ],
                    "correct_index": 0,
                    "explanation": "Adam memadukan keunggulan momentum (momen pertama untuk mengarahkan langkah) dan RMSprop (momen kedua untuk adaptasi learning rate per parameter)."
                }
            },
            {
                "id": "ioai_11_pytorch_deep_learning",
                "title": "8.3 Implementasi Deep Learning Praktis dengan PyTorch & CUDA",
                "type": "CODING",
                "content_path": "modules/ioai_11_pytorch_deep_learning.md",
                "video_url": "https://www.youtube.com/embed/V_xro1bcAuA",
                "starter_code": "def calculate_linear_layer_output(batch_size: int, in_features: int, out_features: int) -> tuple[int, int]:\n    # Kembalikan dimensi bentuk (shape) tensor output dari lapisan nn.Linear(in_features, out_features)\n    pass\n",
                "test_assertions": "assert calculate_linear_layer_output(32, 128, 10) == (32, 10)\nassert calculate_linear_layer_output(64, 512, 64) == (64, 64)\nprint('PyTorch layer dimension assertion passed!')"
            }
        ]
    },
    {
        "id": "module_ioai_computer_vision",
        "title": "Modul 9: [IOAI] Penglihatan Komputer (Computer Vision)",
        "description": "Pengolahan citra digital 2D, filter konvolusi, arsitektur Convolutional Neural Networks (CNN), ResNet, deteksi objek YOLO, dan segmentasi U-Net.",
        "level": "Lanjutan",
        "estimated_hours": 24,
        "lessons": [
            {
                "id": "ioai_12_image_fundamentals",
                "title": "9.1 Fondasi Citra Digital & Operasi Konvolusi 2D",
                "type": "THEORY",
                "content_path": "modules/ioai_12_image_fundamentals.md",
                "video_url": "https://www.youtube.com/embed/KuXjwB4LzSA",
                "quiz": {
                    "question": "Jika filter Sobel horizontal $K_{\\text{Sobel}_x}$ diterapkan pada citra digital, fitur visual apa yang paling ditonjolkan pada output feature map?",
                    "options": [
                        "Garis tepi vertikal yang mengalami perubahan kontras kecerahan tajam dari kiri ke kanan",
                        "Seluruh warna piksel biru menjadi hitam",
                        "Citra mengalami rotasi sudut 90 derajat",
                        "Derau noise frekuensi tinggi meningkat secara merata"
                    ],
                    "correct_index": 0,
                    "explanation": "Filter Sobel-X menghitung aproksimasi turunan gradien parsial secara horizontal ($\\partial I / \\partial x$), sehingga sangat responsif menonjolkan garis tepi vertikal."
                }
            },
            {
                "id": "ioai_13_cnn_architectures",
                "title": "9.2 Convolutional Neural Networks (CNN) & Arsitektur ResNet",
                "type": "THEORY",
                "content_path": "modules/ioai_13_cnn_architectures.md",
                "video_url": "https://www.youtube.com/embed/vT1JzLTH4G4",
                "quiz": {
                    "question": "Apa fungsi utama inovasi Residual Connection (skip/shortcut connection $\\mathcal{F}(\\mathbf{x}) + \\mathbf{x}$) pada arsitektur ResNet?",
                    "options": [
                        "Mengalirkan gradien secara langsung tanpa terhalang ke lapisan awal, memungkinkan pelatihan jaringan yang sangat dalam tanpa degradasi",
                        "Menghapus kebutuhan lapisan konvolusi di seluruh jaringan",
                        "Mengubah resolusi gambar menjadi 1x1 secara otomatis",
                        "Mengganti fungsi aktivasi ReLU dengan fungsi linier murni"
                    ],
                    "correct_index": 0,
                    "explanation": "Skip connection menyediakan jalur pintas langsung bagi gradien selama backpropagation, mengatasi degradasi performa dan vanishing gradient pada kedalaman hingga ratusan layer."
                }
            },
            {
                "id": "ioai_14_object_detection_segmentation",
                "title": "9.3 Deteksi Objek (IoU, YOLO) & Segmentasi U-Net",
                "type": "CODING",
                "content_path": "modules/ioai_14_object_detection_segmentation.md",
                "video_url": "https://www.youtube.com/embed/ag3DLKsl2vk",
                "starter_code": "def compute_iou(boxA: list[float], boxB: list[float]) -> float:\n    # Format box: [x1, y1, x2, y2]\n    # Hitung Intersection over Union (IoU) antara boxA dan boxB\n    pass\n",
                "test_assertions": "# box: [0, 0, 10, 10] dan [5, 0, 15, 10]\n# Intersection area = 5 * 10 = 50\n# Area A = 100, Area B = 100, Union = 100 + 100 - 50 = 150\n# IoU = 50 / 150 = 0.3333\nprint('IoU testing framework ready!')"
            }
        ]
    },
    {
        "id": "module_ioai_nlp",
        "title": "Modul 10: [IOAI] Pengolahan Bahasa Alami (NLP) & Transformer",
        "description": "Representasi teks, TF-IDF, Word Embeddings (Word2Vec, GloVe), model sekuensial LSTM, arsitektur Transformer Self-Attention, dan fondasi Large Language Models (LLM).",
        "level": "Lanjutan",
        "estimated_hours": 26,
        "lessons": [
            {
                "id": "ioai_15_text_processing_embeddings",
                "title": "10.1 Representasi Teks, TF-IDF, & Word Embeddings (Word2Vec)",
                "type": "THEORY",
                "content_path": "modules/ioai_15_text_processing_embeddings.md",
                "video_url": "https://www.youtube.com/embed/viZrOnJclYI",
                "quiz": {
                    "question": "Mengapa representasi padat (Dense Word Embedding) lebih unggul daripada representasi One-Hot Encoding tradisional dalam pemrosesan teks?",
                    "options": [
                        "Dense embedding menangkap kemiripan makna semantik antarkata dalam ruang vektor berdimensi rendah dan tetap",
                        "One-hot encoding membutuhkan ruang disk yang lebih kecil daripada word2vec",
                        "One-hot encoding hanya dapat digunakan untuk bahasa Inggris",
                        "Dense embedding menghapus kebutuhan komputasi matriks"
                    ],
                    "correct_index": 0,
                    "explanation": "Dense embedding memetakan kata ke ruang kontinu (misal 300 dimensi) di mana kata-kata dengan konteks semantik serupa memiliki jarak sudut kecil (cosine similarity tinggi), mengatasi masalah sparsity dan ketiadaan makna pada one-hot encoding."
                }
            },
            {
                "id": "ioai_16_rnn_lstm_nlp",
                "title": "10.2 Model Sekuensial LSTM untuk Pemrosesan Bahasa Alami",
                "type": "THEORY",
                "content_path": "modules/ioai_16_rnn_lstm_nlp.md",
                "video_url": "https://www.youtube.com/embed/8HyCNIVRbSU",
                "quiz": {
                    "question": "Pada sel LSTM, apa fungsi utama dari gerbang lupa (Forget Gate $f_t$)?",
                    "options": [
                        "Menentukan proporsi informasi dari status sel sebelumnya ($C_{t-1}$) yang harus dipertahankan atau dibuang",
                        "Menghentikan proses backpropagation seketika",
                        "Mengubah teks menjadi format token biner",
                        "Menghitung skor evaluasi akurasi sentimen"
                    ],
                    "correct_index": 0,
                    "explanation": "Forget gate menerapkan fungsi sigmoid pada $[h_{t-1}, x_t]$ untuk menghasilkan nilai antara 0 (lupakan seluruhnya) dan 1 (pertahankan seluruhnya) terhadap memori sel sebelumnya."
                }
            },
            {
                "id": "ioai_17_transformers_llm",
                "title": "10.3 Arsitektur Transformer, Self-Attention, & Fondasi LLM Modern",
                "type": "THEORY",
                "content_path": "modules/ioai_17_transformers_llm.md",
                "video_url": "https://www.youtube.com/embed/SZorAJ4I-sA",
                "quiz": {
                    "question": "Pada mekanisme Scaled Dot-Product Attention: $\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$, apa fungsi pembagian dengan faktor skalar $\\sqrt{d_k}$?",
                    "options": [
                        "Mencegah nilai dot product menjadi terlalu besar pada dimensi tinggi yang dapat menyebabkan gradien softmax jenuh dan mengecil",
                        "Membuat ukuran matriks $Q$ dan $K$ menjadi sama dengan $V$",
                        "Menghapus token kata yang tidak memiliki padanan dalam kamus",
                        "Memaksa jumlah kata dalam kalimat menjadi kelipatan genap"
                    ],
                    "correct_index": 0,
                    "explanation": "Ketika dimensi $d_k$ besar, nilai dot product $QK^T$ tumbuh membesar sehingga fungsi softmax terdorong ke wilayah dengan gradien yang sangat kecil. Penskalaan dengan $1/\\sqrt{d_k}$ menjaga kestabilan numerik gradien."
                }
            }
        ]
    }
]

# Combine: 5 original foundation modules + 5 new IOAI modules = 10 complete modules!
full_manifest = orig_modules + ioai_modules

with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
    json.dump(full_manifest, f, indent=2, ensure_ascii=False)

print(f"[OK] Manifest successfully written with {len(full_manifest)} total modules!")
for idx, mod in enumerate(full_manifest):
    print(f"  {idx+1}. {mod['title']} ({len(mod['lessons'])} lessons)")

# 3. Synchronize with SQLite Database
print("\nSynchronizing curriculum to SQLite database...")
from backend.app.services.curriculum_service import sync_curriculum_to_db, get_curriculum_tree
sync_curriculum_to_db()

tree = get_curriculum_tree()
total_db_lessons = sum(len(m["lessons"]) for m in tree)
print(f"[OK] Database sync complete! Total lessons in database: {total_db_lessons}")
