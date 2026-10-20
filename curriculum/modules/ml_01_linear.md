# Regresi Linier & Optimasi Gradient Descent

## Perumusan Model Linier

Model regresi linier memprediksi target kontinu $\hat{y}$ sebagai kombinasi linier dari fitur input $X$:

$$\hat{y} = X w + b$$

### Fungsi Loss: Residual Sum of Squares

Fungsi loss kuadrat terkecil mengukur deviasi antara prediksi dan nilai target aktual:

$$J(w, b) = \frac{1}{2m} \sum_{i=1}^m (h_w(x^{(i)}) - y^{(i)})^2$$

### Pembaruan Bobot Gradient Descent

$$\frac{\partial J}{\partial w_j} = \frac{1}{m} \sum_{i=1}^m (h_w(x^{(i)}) - y^{(i)}) x_j^{(i)}$$

$$w_j \leftarrow w_j - \alpha \frac{\partial J}{\partial w_j}$$
