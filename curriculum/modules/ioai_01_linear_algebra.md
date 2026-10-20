# Aljabar Linear: Vektor, Matriks, & Dekomposisi Spektral

Aljabar linear adalah fondasi universal untuk merepresentasikan dan memanipulasi data dalam *Machine Learning* dan *Artificial Intelligence*. Seluruh struktur komputasi modern—mulai dari citra digital (tensor 3D), representasi kata (vektor berdimensi tinggi), hingga kumpulan bobot jaringan saraf tiruan—beroperasi di atas ruang vektor aljabar linear.

---

## 1. Skalar, Vektor, dan Matriks

- **Skalar** ($s \in \mathbb{R}$): Nilai numerik tunggal berdimensi nol.
- **Vektor** ($\mathbf{x} \in \mathbb{R}^n$): Kumpulan nilai berdimensi 1 yang merepresentasikan arah dan magnitudo:
  $$\mathbf{x} = \begin{bmatrix} x_1 \\ x_2 \\ \vdots \\ x_n \end{bmatrix}$$
- **Matriks** ($\mathbf{A} \in \mathbb{R}^{m \times n}$): Susunan array 2 dimensi dengan $m$ baris dan $n$ kolom:
  $$\mathbf{A} = \begin{bmatrix} a_{11} & a_{12} & \cdots & a_{1n} \\ a_{21} & a_{22} & \cdots & a_{2n} \\ \vdots & \vdots & \ddots & \vdots \\ a_{m1} & a_{m2} & \cdots & a_{mn} \end{bmatrix}$$

---

## 2. Operasi Fundamental Matriks

### Perkalian Titik (Dot Product)
Untuk dua vektor $\mathbf{u}, \mathbf{v} \in \mathbb{R}^n$:
$$\mathbf{u} \cdot \mathbf{v} = \mathbf{u}^T \mathbf{v} = \sum_{i=1}^n u_i v_i = \|\mathbf{u}\| \|\mathbf{v}\| \cos(\theta)$$
Dot product mengukur kemiripan arah (*directional similarity*) antar dua vektor.

### Perkalian Matriks
Dua matriks $\mathbf{A} \in \mathbb{R}^{m \times k}$ dan $\mathbf{B} \in \mathbb{R}^{k \times n}$ menghasilkan matriks $\mathbf{C} = \mathbf{A}\mathbf{B} \in \mathbb{R}^{m \times n}$:
$$c_{ij} = \sum_{p=1}^k a_{ip} b_{pj}$$

> [!NOTE]
> Syarat perkalian matriks: jumlah kolom matriks pertama harus sama persis dengan jumlah baris matriks kedua.

---

## 3. Invers dan Rank Matriks

### Invers Matriks ($\mathbf{A}^{-1}$)
Untuk matriks persegi $\mathbf{A} \in \mathbb{R}^{n \times n}$, invers didefinisikan sebagai:
$$\mathbf{A} \mathbf{A}^{-1} = \mathbf{A}^{-1} \mathbf{A} = \mathbf{I}_n$$
Matriks memiliki invers (non-singular) jika dan hanya jika determinannya tidak nol: $\det(\mathbf{A}) \neq 0$.

### Rank Matriks
Rank matriks adalah jumlah maksimum kolom (atau baris) yang saling bebas linear (*linearly independent*).
- Jika $\text{rank}(\mathbf{A}) = \min(m, n)$, matriks dikatakan memiliki **full rank**.
- Rank menentukan kapasitas informasi dan dimensi efektif ruang kolom dari data.

---

## 4. Eigenvalue, Eigenvector, & SVD

### Persamaan Karakteristik Eigen
Untuk transformasi matriks persegi $\mathbf{A}$:
$$\mathbf{A} \mathbf{v} = \lambda \mathbf{v}$$
Di mana $\mathbf{v} \neq \mathbf{0}$ adalah **eigenvector** dan $\lambda$ adalah skalar **eigenvalue**. Matriks hanya meregangkan vektor $\mathbf{v}$ sebesar faktor $\lambda$ tanpa mengubah orientasi garis vektornya.

### Singular Value Decomposition (SVD)
Setiap matriks nyata $\mathbf{A} \in \mathbb{R}^{m \times n}$ dapat difaktorisasi menjadi tiga matriks:
$$\mathbf{A} = \mathbf{U} \mathbf{\Sigma} \mathbf{V}^T$$
- $\mathbf{U} \in \mathbb{R}^{m \times m}$: Matriks ortogonal vektor singular kiri (eigenvector dari $\mathbf{A}\mathbf{A}^T$).
- $\mathbf{\Sigma} \in \mathbb{R}^{m \times n}$: Matriks diagonal dengan nilai singular non-negatif ($\sigma_1 \ge \sigma_2 \ge \dots \ge 0$).
- $\mathbf{V} \in \mathbb{R}^{n \times n}$: Matriks ortogonal vektor singular kanan (eigenvector dari $\mathbf{A}^T\mathbf{A}$).

---

## 5. Contoh Kode NumPy

```python
import numpy as np

A = np.array([[4.0, 2.0], [1.0, 3.0]])
eigenvalues, eigenvectors = np.linalg.eig(A)
print("Eigenvalues:", eigenvalues)
print("Eigenvectors:
", eigenvectors)

U, S, Vt = np.linalg.svd(A)
print("Singular Values:", S)
```