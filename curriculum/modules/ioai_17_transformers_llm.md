# Arsitektur Transformer & Fondasi Model Bahasa (LLM)

Diperkenalkan dalam makalah legendaris *"Attention Is All You Need"* (Vaswani et al., 2017), arsitektur **Transformer** merevolusi seluruh lanskap kecerdasan buatan dengan membuang ketergantungan rekursif RNN dan menggantikannya sepenuhnya dengan mekanisme **Self-Attention**.

---

## 1. Mekanisme Scaled Dot-Product Attention

Perhatian mandiri (*Self-Attention*) memungkinkan setiap token kata dalam kalimat memperhatikan dan menimbang hubungan dengan seluruh kata lain secara langsung, tanpa memandang jarak posisi dalam teks.

Setiap token diproyeksikan menjadi tiga vektor:
- **Query ($Q$)**: *"Apa yang sedang saya cari?"*
- **Key ($K$)**: *"Karakteristik atau label apa yang saya miliki?"*
- **Value ($V$)**: *"Informasi apa yang saya simpan?"*

### Rumus Matematis Self-Attention:
$$\text{Attention}(Q, K, V) = \text{softmax}\left( \frac{QK^T}{\sqrt{d_k}} \right) V$$
Faktor $\frac{1}{\sqrt{d_k}}$ berfungsi menjaga kestabilan magnitudo dot product agar gradien softmax tidak mengalami saturasi pada dimensi tinggi.

---

## 2. Multi-Head Attention & Positional Encoding

### Multi-Head Attention
Memproyeksikan $Q, K, V$ ke dalam $h$ ruang representasi yang berbeda secara paralel, memungkinkan model memperhatikan aspek hubungan sintaksis dan semantik yang beragam secara simultan:
$$\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, \dots, \text{head}_h) W^O$$

### Positional Encoding
Karena transformer memproses seluruh token kalimat sekaligus (*parallel processing*), urutan kata disuntikkan secara eksplisit menggunakan fungsi gelombang sinusoidal:
$$PE_{(pos, 2i)} = \sin\left( \frac{pos}{10000^{2i / d_{\text{model}}}} \right)$$
$$PE_{(pos, 2i+1)} = \cos\left( \frac{pos}{10000^{2i / d_{\text{model}}}} \right)$$

---

## 3. Ekosistem Large Language Models (LLM)

Arsitektur Transformer menjadi fondasi utama seluruh model generasi teks modern:
1. **Encoder-Only (BERT)**: Sangat andal untuk klasifikasi teks, penamaan entitas (NER), dan ekstraksi informasi.
2. **Decoder-Only (GPT, Llama, Mistral)**: Model kausal *autoregressive* yang memprediksi kata berikutnya secara berturut-turut untuk generasi teks alami dan penalaran kompleks.
3. **Encoder-Decoder (T5, BART)**: Dirancang untuk tugas terjemahan bahasa (*machine translation*) dan peringkasan teks (*summarization*).