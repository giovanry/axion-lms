# Praproses Data, Skalasi, & Reduksi Dimensi PCA

Kualitas data menentukan batas atas performa model machine learning (*Garbage In, Garbage Out*). Tahap praproses data mempersiapkan fitur numerik dan kategorikal ke format representasi yang stabil untuk komputasi numerik.

---

## 1. Penanganan Nilai Hilang (Missing Values)

- **Penghapusan (Dropping)**: Menghapus baris/kolom dengan nilai hilang jika proporsinya $< 5\%$ atau tidak informatif.
- **Imputasi Statistik**: Mengisi nilai hilang dengan Mean (untuk data terdistribusi normal) atau Median (untuk data condong / banyak outlier).
- **Imputasi Berbasis Model**: Menggunakan KNN Imputer atau regresi iteratif.

---

## 2. Normalisasi & Standarisasi Fitur

### Standarisasi Z-Score
Mentransformasi fitur sehingga memiliki $\mu = 0$ dan $\sigma = 1$:
$$z = \frac{x - \mu}{\sigma}$$
Wajib digunakan untuk algoritma berbasis jarak (KNN, K-Means) dan model berbasis gradient descent (Logistic Regression, Neural Networks).

### Min-Max Normalization (Rescaling)
Memetakan nilai fitur ke dalam rentang tertutup $[0, 1]$:
$$x_{\text{norm}} = \frac{x - x_{\min}}{x_{\max} - x_{\min}}$$

---

## 3. Reduksi Dimensi dengan PCA (Principal Component Analysis)

Principal Component Analysis (PCA) adalah teknik reduksi dimensi linear tanpa supervisi (*unsupervised*) yang memproyeksikan data ke arah varians maksimum.

### Langkah Matematis PCA:
1. **Pusatkan Data**: Kurangkan setiap fitur dengan rata-ratanya: $\mathbf{X}_{\text{centered}} = \mathbf{X} - \bar{\mathbf{X}}$.
2. **Hitung Matriks Kovarians**:
   $$\mathbf{C} = \frac{1}{n-1} \mathbf{X}^T \mathbf{X}$$
3. **Dekomposisi Eigen**:
   $$\mathbf{C} \mathbf{v}_i = \lambda_i \mathbf{v}_i$$
   Di mana $\lambda_i$ mengukur besarnya varians yang dijelaskan oleh komponen utama $\mathbf{v}_i$.
4. **Proyeksikan Data**: Pilih $k$ eigenvector dengan eigenvalue terbesar $\mathbf{W} = [\mathbf{v}_1, \dots, \mathbf{v}_k]$:
   $$\mathbf{Z} = \mathbf{X} \mathbf{W}$$