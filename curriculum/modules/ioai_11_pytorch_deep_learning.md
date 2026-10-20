# Framework PyTorch, Autograd, & Pelatihan Model

PyTorch adalah kerangka kerja (*framework*) deep learning paling dominan di dunia riset AI dan kompetisi kompetitif karena sifat graf komputasi dinamisnya (*define-by-run*) dan integrasi perangkat keras CUDA yang mulus.

---

## 1. Komputasi Tensor & Mesin Autograd

Tensor PyTorch mirip dengan array NumPy, namun dilengkapi kemampuan komputasi pada GPU NVIDIA dan pelacakan gradien otomatis (*automatic differentiation*):

```python
import torch

# Membuat tensor dengan pelacakan gradien aktif
x = torch.tensor([2.0, 3.0], requires_grad=True)
y = x[0]**2 + 3 * x[1]**3

# Hitung gradien parsial dy/dx
y.backward()
print("Gradien x:", x.grad)  # [4.0, 81.0]
```

---

## 2. Struktur Modul Jaringan (`torch.nn.Module`)

Setiap arsitektur di PyTorch didefinisikan sebagai subclass dari `nn.Module`:

```python
import torch
import torch.nn as nn

class MultiLayerPerceptron(nn.Module):
    def __init__(self, in_features: int, hidden: int, num_classes: int):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(in_features, hidden),
            nn.BatchNorm1d(hidden),
            nn.ReLU(),
            nn.Dropout(p=0.2),
            nn.Linear(hidden, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)
```

---

## 3. Alur Loop Pelatihan Standar (Training Loop)

Setiap iterasi pelatihan di PyTorch mengikuti pola 5 langkah wajib:

```python
# 1. Bersihkan gradien akumulasi dari iterasi sebelumnya
optimizer.zero_grad()

# 2. Forward pass: hitung prediksi model
outputs = model(inputs)

# 3. Hitung nilai loss fungsi objektif
loss = criterion(outputs, targets)

# 4. Backward pass: hitung turunan gradien otomatis
loss.backward()

# 5. Optimizer step: perbarui bobot parameter
optimizer.step()
```