# Perceptron & Fungsi Aktivasi Non-Linear

Jaringan saraf tiruan (*Artificial Neural Networks*) terinspirasi dari struktur neuron biologis di otak manusia. Unit pemrosesan paling mendasar adalah **Perceptron**, yang kemudian dikembangkan dengan berbagai fungsi aktivasi non-linear.

---

## 1. Struktur Matematika Perceptron

Perceptron menerima input vektor $\mathbf{x} = [x_1, \dots, x_d]^T$, mengalikannya dengan bobot $\mathbf{w} = [w_1, \dots, w_d]^T$, menambahkan bias $b$, lalu meneruskannya ke fungsi aktivasi:
$$z = \sum_{i=1}^d w_i x_i + b = \mathbf{w}^T \mathbf{x} + b$$
$$\hat{y} = g(z)$$

### Masalah Linear Separability (XOR Problem)
Perceptron tunggal dengan aktivasi step function hanya mampu menyelesaikan masalah yang dapat dipisahkan secara linier (*linearly separable*) seperti fungsi AND dan OR. Perceptron tunggal terbukti gagal memecahkan fungsi XOR. Solusinya adalah menyusun beberapa lapisan perceptron (**Multilayer Perceptron**) dengan fungsi aktivasi non-linear.

---

## 2. Spektrum Fungsi Aktivasi Non-Linear

### A. Sigmoid (Logistik)
$$\sigma(z) = \frac{1}{1 + e^{-z}}, \quad \sigma'(z) = \sigma(z)(1 - \sigma(z))$$
- Output berada pada rentang $(0, 1)$, ideal untuk probabilitas biner.
- Kekurangan: Rentan terhadap masalah *vanishing gradient* pada nilai $|z|$ besar, dan output tidak terpusat di nol (*zero-centered*).

### B. Tangen Hiperbolik (Tanh)
$$\tanh(z) = \frac{e^z - e^{-z}}{e^z + e^{-z}}, \quad \tanh'(z) = 1 - \tanh^2(z)$$
- Output berada pada rentang $(-1, 1)$ dan terpusat pada nol (*zero-centered*).

### C. ReLU (Rectified Linear Unit)
$$\text{ReLU}(z) = \max(0, z), \quad \text{ReLU}'(z) = \begin{cases} 1 & \text{jika } z > 0 \\ 0 & \text{jika } z \le 0 \end{cases}$$
- Paling populer dalam deep learning modern karena komputasinya sangat cepat dan tidak mengalami saturasi gradien pada domain positif ($z > 0$).
- Varian: **Leaky ReLU** ($\max(0.01z, z)$) untuk mencegah neuron mati (*dying ReLU problem*).

### D. Softmax (Klasifikasi Multi-Kelas)
Menormalisasi vektor skor logit $\mathbf{z}$ menjadi distribusi probabilitas:
$$\text{Softmax}(z_i) = \frac{e^{z_i}}{\sum_{j=1}^C e^{z_j}}$$