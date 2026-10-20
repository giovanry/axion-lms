# Evaluasi Metrik Klasifikasi: Presisi, Recall, & F1-Score

## Matriks Kebingungan (Confusion Matrix)

Pada klasifikasi biner, hasil prediksi dibagi menjadi empat kuadran:
- **TP (True Positive):** Positif diprediksi Positif
- **FP (False Positive):** Negatif diprediksi Positif
- **FN (False Negative):** Positif diprediksi Negatif
- **TN (True Negative):** Negatif diprediksi Negatif

### Rumus Matematis

$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}$$

$$\text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}$$

$$F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}} = \frac{2\text{TP}}{2\text{TP} + \text{FP} + \text{FN}}$$

## Tantangan
Implementasikan `calculate_f1_score(tp, fp, fn)` mengembalikan nilai $F_1$ float.
