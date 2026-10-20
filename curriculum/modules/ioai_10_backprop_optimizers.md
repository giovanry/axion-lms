# Multilayer Perceptron, Backpropagation, & Optimizer

Multilayer Perceptron (MLP) adalah jaringan saraf tiruan berarah (*feedforward neural network*) yang terdiri atas satu lapisan input, satu atau lebih lapisan tersembunyi (*hidden layers*), dan satu lapisan output.

---

## 1. Algoritma Backpropagation & Aturan Rantai

Backpropagation adalah algoritma cerdas untuk menghitung turunan parsial dari fungsi loss $\mathcal{L}$ terhadap setiap bobot parameter $w_{ij}$ dalam jaringan menggunakan aturan rantai kalkulus (*chain rule*).

### Formulasi Turunan Rantai:
Untuk bobot $w_{jk}$ yang menghubungkan neuron $j$ ke neuron $k$:
$$\frac{\partial \mathcal{L}}{\partial w_{jk}} = \frac{\partial \mathcal{L}}{\partial a_k} \cdot \frac{\partial a_k}{\partial z_k} \cdot \frac{\partial z_k}{\partial w_{jk}} = \delta_k \cdot a_j$$
Di mana:
- $z_k = \sum_j w_{jk} a_j + b_k$ adalah kombinasi linear.
- $\delta_k = \frac{\partial \mathcal{L}}{\partial z_k}$ adalah sinyal error yang dipropagasikan mundur dari lapisan output menuju lapisan awal.

---

## 2. Algoritma Optimasi Modern

### A. Stochastic Gradient Descent (SGD) dengan Momentum
Menyimpan memori kecepatan arah langkah sebelumnya untuk meredam osilasi:
$$\mathbf{v}_t = \beta \mathbf{v}_{t-1} + (1 - \beta) \nabla_\theta \mathcal{L}$$
$$\theta_t = \theta_{t-1} - \alpha \mathbf{v}_t$$

### B. RMSprop (Root Mean Square Propagation)
Menyesuaikan laju pembaruan per-parameter dengan membagi gradien terhadap rata-rata bergerak kuadrat gradien:
$$\mathbf{s}_t = \beta \mathbf{s}_{t-1} + (1 - \beta) (\nabla_\theta \mathcal{L})^2$$
$$\theta_t = \theta_{t-1} - \frac{\alpha}{\sqrt{\mathbf{s}_t} + \epsilon} \nabla_\theta \mathcal{L}$$

### C. Adam (Adaptive Moment Estimation)
Menggabungkan keunggulan momentum (momen pertama) dan RMSprop (momen kedua) dengan koreksi bias:
$$\hat{\mathbf{m}}_t = \frac{\mathbf{m}_t}{1 - \beta_1^t}, \quad \hat{\mathbf{v}}_t = \frac{\mathbf{v}_t}{1 - \beta_2^t}$$
$$\theta_t = \theta_{t-1} - \frac{\alpha}{\sqrt{\hat{\mathbf{v}}_t} + \epsilon} \hat{\mathbf{m}}_t$$
Adam adalah optimizer standar paling andal untuk melatih model deep learning kontemporer.