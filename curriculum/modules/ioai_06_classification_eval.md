# Model Klasifikasi & Metrik Evaluasi Komprehensif

Klasifikasi adalah tugas *supervised learning* di mana model memetakan vektor fitur input $\mathbf{x}$ ke salah satu kelas diskrit $y \in \{0, 1, \dots, C-1\}$.

---

## 1. Algoritma Klasifikasi Utama

### A. K-Nearest Neighbors (KNN)
Algoritma *instance-based non-parametrik*. Memprediksi label sampel baru berdasarkan mayoritas voting dari $k$ tetangga terdekat menggunakan jarak Euclidean:
$$d(\mathbf{p}, \mathbf{q}) = \sqrt{\sum_{i=1}^d (p_i - q_i)^2}$$

### B. Regresi Logistik
Model linier probabilistik yang memetakan kombinasi linier fitur ke rentang probabilitas $(0, 1)$ menggunakan fungsi logistik Sigmoid:
$$P(y=1|\mathbf{x}) = \sigma(\mathbf{w}^T \mathbf{x} + b) = \frac{1}{1 + e^{-(\mathbf{w}^T \mathbf{x} + b)}}$$
Dioptimalkan dengan meminimalkan fungsi **Binary Cross-Entropy Loss**:
$$\mathcal{L}(\mathbf{w}) = -\frac{1}{N} \sum_{i=1}^N \left[ y_i \log(\hat{y}_i) + (1 - y_i) \log(1 - \hat{y}_i) \right]$$

### C. Decision Tree (Pohon Keputusan)
Membagi ruang fitur secara rekursif berdasarkan kriteria pemisahan kemurnian node:
- **Gini Impurity**: $I_G = 1 - \sum_{i=1}^C p_i^2$
- **Entropi Informasi**: $H = -\sum_{i=1}^C p_i \log_2(p_i)$

---

## 2. Confusion Matrix & Metrik Evaluasi

$$\begin{array}{c|cc}
& \text{Prediksi Positif} & \text{Prediksi Negatif} \\
\hline
\text{Aktual Positif} & \text{TP (True Positive)} & \text{FN (False Negative)} \\
\text{Aktual Negatif} & \text{FP (False Positive)} & \text{TN (True Negative)}
\end{array}$$

- **Accuracy**: $\frac{\text{TP} + \text{TN}}{\text{TP} + \text{TN} + \text{FP} + \text{FN}}$
- **Precision**: $\frac{\text{TP}}{\text{TP} + \text{FP}}$ (Kemampuan menghindari salah tuduh positif)
- **Recall / Sensitivity**: $\frac{\text{TP}}{\text{TP} + \text{FN}}$ (Kemampuan menangkap seluruh kasus positif)
- **F1-Score**: Rata-rata harmonik antara presisi dan recall:
  $$F_1 = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$
- **ROC-AUC**: Luas area di bawah kurva *Receiver Operating Characteristic* (True Positive Rate vs False Positive Rate).