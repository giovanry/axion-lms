# Kalkulus Multivariat & Teori Optimasi

Optimasi adalah jantung dari proses pembelajaran mesin. Hampir seluruh algoritma *Machine Learning* dan *Deep Learning* bekerja dengan memformulasikan tujuan sebagai fungsi biaya (*loss/cost function*), kemudian mencari parameter model yang meminimalkan nilai fungsi tersebut menggunakan kalkulus diferensial.

---

## 1. Turunan Parsial & Vektor Gradien

### Turunan Parsial
Untuk fungsi multivariat $f(x_1, x_2, \dots, x_n)$, turunan parsial terhadap variabel $x_i$ mengukur laju perubahan fungsi ketika hanya variabel $x_i$ yang divariasikan:
$$\frac{\partial f}{\partial x_i} = \lim_{h \to 0} \frac{f(x_1, \dots, x_i + h, \dots, x_n) - f(x_1, \dots, x_i, \dots, x_n)}{h}$$

### Vektor Gradien ($\nabla f$)
Gradien mengumpulkan seluruh turunan parsial ke dalam satu vektor kolom:
$$\nabla f(\mathbf{x}) = \begin{bmatrix} \frac{\partial f}{\partial x_1} \\ \frac{\partial f}{\partial x_2} \\ \vdots \\ \frac{\partial f}{\partial x_n} \end{bmatrix}$$

> [!IMPORTANT]
> **Arah Gradien**: Vektor gradien $\nabla f(\mathbf{x})$ selalu menunjuk ke arah **peningkatan fungsi tercepat** (*steepest ascent*). Untuk meminimalkan fungsi loss, pembaruan parameter bergerak ke arah sebaliknya: $-\nabla f(\mathbf{x})$ (*steepest descent*).

---

## 2. Matriks Hessian & Uji Kelengkungan

Matriks Hessian $\mathbf{H}$ memuat seluruh turunan parsial orde dua dari fungsi $f$:
$$\mathbf{H}_{ij} = \frac{\partial^2 f}{\partial x_i \partial x_j}$$
- Jika matriks Hessian **definit positif** (seluruh eigenvalue $> 0$) pada titik stasioner $\nabla f = \mathbf{0}$, titik tersebut adalah **minimum lokal**.
- Jika **definit negatif** (seluruh eigenvalue $< 0$), titik tersebut adalah **maksimum lokal**.
- Jika memiliki eigenvalue positif dan negatif, titik tersebut adalah **saddle point** (titik pelana).

---

## 3. Algoritma Gradient Descent

Rumus pembaruan parameter iteratif untuk bobot $\theta$:
$$\theta_{t+1} = \theta_t - \alpha \nabla_\theta \mathcal{L}(\theta_t)$$
Di mana $\alpha > 0$ adalah **learning rate** (laju pembelajaran).

```python
import numpy as np

def loss_func(w):
    return (w - 3.5)**2 + 2.0

def grad_loss(w):
    return 2 * (w - 3.5)

w = 10.0
lr = 0.1
for step in range(25):
    w -= lr * grad_loss(w)

print(f"Hasil konvergensi bobot optimal w*: {w:.4f}")
```