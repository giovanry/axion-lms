# Regresi Linier Teratur: Ridge, LASSO, & Elastic Net

Regresi linier memprediksi variabel target kontinu $y \in \mathbb{R}$. Namun pada dataset nyata berdimensi tinggi atau dengan korelasi antarkolom yang kuat (multikolinearitas), regresi linier biasa (Ordinary Least Squares - OLS) rentan mengalami *overfitting* dan memiliki varians bobot yang ekstrem.

---

## 1. Ordinary Least Squares (OLS)

Fungsi loss kuadrat terkecil murni:
$$\mathcal{L}_{\text{OLS}}(\mathbf{w}) = \frac{1}{2n} \sum_{i=1}^n (y_i - \mathbf{w}^T \mathbf{x}_i)^2 = \frac{1}{2n} \|\mathbf{y} - \mathbf{X}\mathbf{w}\|^2_2$$

---

## 2. Regularisasi Ridge ($L_2$)

Menambahkan penalti kuadrat magnitudo bobot ke dalam fungsi loss:
$$\mathcal{L}_{\text{Ridge}}(\mathbf{w}) = \frac{1}{2n} \|\mathbf{y} - \mathbf{X}\mathbf{w}\|^2_2 + \lambda \sum_{j=1}^d w_j^2$$
- Menyusutkan nilai bobot mendekati nol (*weight decay*), tetapi tidak pernah menjadikannya nol secara tepat.
- Menstabilkan invers matriks ketika ada multikolinearitas: $\mathbf{w}^* = (\mathbf{X}^T \mathbf{X} + \lambda \mathbf{I})^{-1} \mathbf{X}^T \mathbf{y}$.

---

## 3. Regularisasi LASSO ($L_1$)

Menambahkan penalti nilai mutlak magnitudo bobot:
$$\mathcal{L}_{\text{LASSO}}(\mathbf{w}) = \frac{1}{2n} \|\mathbf{y} - \mathbf{X}\mathbf{w}\|^2_2 + \lambda \sum_{j=1}^d |w_j|$$
- **Sparsity & Feature Selection**: Karena kontur geometri norma $L_1$ berbentuk wajik bersudut lancip pada sumbu koordinat, LASSO mampu memaksa bobot fitur yang tidak relevan menjadi **tepat nol**.
- Menghasilkan model yang lebih sederhana dan mudah diinterpretasikan.

---

## 4. Elastic Net

Kombinasi berbobot antara penalti $L_1$ dan $L_2$:
$$\mathcal{L}_{\text{Elastic}}(\mathbf{w}) = \mathcal{L}_{\text{OLS}} + \lambda_1 \|\mathbf{w}\|_1 + \lambda_2 \|\mathbf{w}\|^2_2$$
Sangat efektif ketika terdapat sekelompok variabel yang saling berkorelasi tinggi (*grouped variable selection*).