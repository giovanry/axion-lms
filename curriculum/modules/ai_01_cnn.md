# Convolutional Neural Networks & Feature Maps

## Operasi Konvolusi 2D

Konvolusi menerapkan kernel filter geser $K$ berukuran $k_h \times k_w$ di atas citra input $I$:

$$S(i, j) = (I * K)(i, j) = \sum_{m} \sum_{n} I(i - m, j - n) K(m, n)$$

### Pooling & Subsampling

Operasi Max Pooling mengambil nilai maksimum pada jendela berukuran $p \times p$:

$$P(i, j) = \max_{0 \le m, n < p} S(i \cdot s + m, j \cdot s + n)$$

Tujuannya adalah:
1. Menurunkan dimensi representasi fitur.
2. Meningkatkan invarian translasi pada objek citra.
