# Praproses Teks, TF-IDF, & Word Embeddings

Pemrosesan Bahasa Alami (*Natural Language Processing* / NLP) menjembatani komunikasi bahasa manusia dan pemahaman komputasi mesin. Karena komputer hanya memahami angka dan matriks, teks harus diubah menjadi representasi vektor numerik.

---

## 1. Alur Praproses Teks Standar

1. **Pembersihan Teks**: Menghapus tanda baca, tag HTML, angka yang tidak relevan, dan konversi ke huruf kecil (*case folding*).
2. **Tokenisasi**: Membagi paragraf atau kalimat menjadi unit-unit kata atau subkata (*tokens*).
3. **Penghapusan Stopwords**: Menyaring kata-kata umum dengan informasi rendah (seperti "dan", "di", "yang").
4. **Lemmatisasi vs Stemming**: Mengembalikan kata ke bentuk dasarnya (misal: "berlari" $\rightarrow$ "lari").

---

## 2. Representasi Klasik: Bag-of-Words & TF-IDF

### Term Frequency - Inverse Document Frequency (TF-IDF)
Mengukur seberapa penting sebuah kata $t$ dalam dokumen $d$ relatif terhadap seluruh korpus koleksi dokumen $D$:
$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \text{IDF}(t, D)$$
$$\text{IDF}(t, D) = \log\left( \frac{1 + |D|}{1 + |\{d \in D : t \in d\}|} \right) + 1$$
Kata yang sering muncul di seluruh dokumen korpus akan diberi bobot penalti rendah, sedangkan kata unik yang sering muncul dalam satu dokumen akan mendapat bobot tinggi.

---

## 3. Dense Word Embeddings: Word2Vec & GloVe

Model TF-IDF menghasilkan representasi vektor yang sangat panjang, jarang (*sparse*), dan tidak menangkap makna semantik (jarak antar kata sama saja). Solusinya adalah **Dense Word Embeddings** di mana setiap kata dipetakan ke vektor padat berdimensi rendah ($d \approx 100 - 300$).

### A. Word2Vec
Berdasarkan hipotesis distribusi: *"kata-kata yang muncul dalam konteks yang mirip memiliki makna yang mirip"*.
- **Continuous Bag of Words (CBOW)**: Memprediksi kata target berdasarkan kata-kata konteks di sekitarnya.
- **Skip-Gram**: Memprediksi kata-kata konteks di sekelilingnya berdasarkan kata target.

### B. Properti Analogi Semantik
Vektor embedding dapat melakukan operasi aritmatika analogi makna:
$$\vec{v}_{\text{King}} - \vec{v}_{\text{Man}} + \vec{v}_{\text{Woman}} \approx \vec{v}_{\text{Queen}}$$
Kedekatan makna diukur menggunakan **Cosine Similarity**:
$$\cos(\theta) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}$$