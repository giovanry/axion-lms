# Fondasi Citra Digital & Filter Konvolusi 2D

Penglihatan Komputer (*Computer Vision*) adalah disiplin ilmu AI yang memungkinkan mesin memahami, mengekstrak informasi, dan mengambil keputusan dari gambar visual dan video dunia nyata.

---

## 1. Representasi Citra Digital

Secara komputasi, citra digital adalah matriks numerik berdimensi 2D atau tensor 3D:
- **Citra Grayscale**: Matriks 2D dengan dimensi $H \times W$ di mana setiap nilai piksel merepresentasikan intensitas cahaya pada rentang $[0, 255]$ ($0 = \text{hitam}$, $255 = \text{putih}$).
- **Citra Warna RGB**: Tensor 3D berukuran $H \times W \times 3$, memuat kanal Red (Merah), Green (Hijau), dan Blue (Biru).

---

## 2. Operasi Konvolusi Citra 2D

Konvolusi citra 2D adalah proses menggeser sebuah matriks kecil berukuran $k \times k$ (disebut **kernel** atau **filter**) di atas seluruh permukaan citra untuk menghasilkan *feature map* baru.

### Formula Konvolusi Diskrit:
$$S(i, j) = (I * K)(i, j) = \sum_m \sum_n I(i - m, j - n) K(m, n)$$

### Contoh Filter Klasik:
1. **Gaussian Blur Filter**: Mengaburkan citra dan mereduksi noise frekuensi tinggi.
2. **Sobel Edge Detector**: Menghitung gradien intensitas spasial untuk mendeteksi tepi garis horizontal dan vertikal:
   $$K_{\text{Sobel}_x} = \begin{bmatrix} -1 & 0 & 1 \\ -2 & 0 & 2 \\ -1 & 0 & 1 \end{bmatrix}, \quad K_{\text{Sobel}_y} = \begin{bmatrix} -1 & -2 & -1 \\ 0 & 0 & 0 \\ 1 & 2 & 1 \end{bmatrix}$$
3. **Laplacian Filter**: Turunan kedua untuk mendeteksi perubahan kontras tajam dari segala arah.