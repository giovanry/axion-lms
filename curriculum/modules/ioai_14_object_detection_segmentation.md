# Deteksi Objek (YOLO) & Segmentasi Citra (U-Net)

Tugas computer vision tingkat lanjut melampaui sekadar klasifikasi label gambar tunggal dengan menemukan lokasi objek secara presisi (*detection*) dan mengidentifikasi batas piksel setiap benda (*segmentation*).

---

## 1. Deteksi Objek (Object Detection)

Tujuan: Memprediksi kelas objek sekaligus koordinat kotak pembatas (*Bounding Box*):
$$\text{BBox} = [x_{\text{center}}, y_{\text{center}}, \text{width}, \text{height}]$$

### A. Metrik Intersection over Union (IoU)
Mengukur tingkat tumpang tindih antara kotak prediksi ($B_{\text{pred}}$) dan kotak sebenarnya ($B_{\text{gt}}$):
$$\text{IoU} = \frac{\text{Area}(B_{\text{pred}} \cap B_{\text{gt}})}{\text{Area}(B_{\text{pred}} \cup B_{\text{gt}})}$$
Prediksi dianggap tepat jika $\text{IoU} \ge 0.5$ (atau threshold yang ditentukan).

### B. Non-Maximum Suppression (NMS)
Algoritma eliminasi kotak redundan: Dari sekian banyak deteksi yang tumpang tindih pada objek yang sama, NMS mempertahankan kotak dengan skor kepercayaan tertinggi dan menghapus kotak lain yang memiliki $\text{IoU} > \text{threshold}$.

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