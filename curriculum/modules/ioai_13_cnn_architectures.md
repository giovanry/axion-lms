# Convolutional Neural Networks (CNN) & ResNet

Jaringan saraf konvolusional (CNN) dirancang khusus untuk memproses data berstruktur kisi spasial seperti gambar, memanfaatkan dua prinsip kunci: **bobot bersama (*parameter sharing*)** dan **konektivitas lokal (*local receptive fields*)**.

---

## 1. Komponen Utama Lapisan CNN

### A. Lapisan Konvolusi (Convolutional Layer)
Menerapkan bank filter $3 \times 3$ atau $5 \times 5$ untuk mengekstrak fitur visual lokal (garis tepi, tekstur, pola).
- **Stride ($s$)**: Jumlah langkah pergeseran filter piksel demi piksel.
- **Padding ($p$)**: Penambahan nilai 0 di sekeliling batas tepi citra untuk mempertahankan ukuran spasial (*Same Padding*).

### Formula Dimensi Spasial Output:
$$W_{\text{out}} = \left\lfloor \frac{W_{\text{in}} - K + 2p}{s} \right\rfloor + 1$$

### B. Lapisan Pooling (Max / Average Pooling)
Mereduksi dimensi spasial (*downsampling*) untuk meningkatkan ketahanan model terhadap pergeseran posisi (*spatial translation invariance*) serta menghemat beban komputasi memori:
$$\text{MaxPool}_{2 \times 2}: \quad (H, W) \longrightarrow \left(\frac{H}{2}, \frac{W}{2}\right)$$

---

## 2. Arsitektur ResNet (Residual Network)

Sebelum adanya ResNet, jaringan CNN yang sangat dalam ($> 20$ layer) mengalami fenomena *degradasi*, di mana akurasi pelatihan justru menurun karena gradien lenyap (*vanishing gradient*).

### Blok Residual (Skip Connection):
ResNet memperkenalkan koneksi pintas (*shortcut/skip connection*) yang melewatkan input $\mathbf{x}$ secara langsung ke output:
$$\mathbf{y} = \mathcal{F}(\mathbf{x}, \{W_i\}) + \mathbf{x}$$
Dengan residual learning, jaringan hanya perlu mempelajari fungsi selisih $\mathcal{F}(\mathbf{x}) = \mathbf{y} - \mathbf{x}$. Jika fungsi identitas optimal, bobot $\mathcal{F}$ dapat dengan mudah didegradasi ke nol tanpa merusak aliran gradien saat backpropagation.