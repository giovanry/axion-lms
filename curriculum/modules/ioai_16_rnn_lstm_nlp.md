# Model Sekuensial: RNN, LSTM, & Analisis Sentimen

Teks adalah data sekuensial alami di mana makna sebuah kata sangat bergantung pada urutan kata-kata sebelumnya. Jaringan neural standar (MLP) tidak memiliki memori urutan dan mensyaratkan input berukuran tetap, sehingga dibutuhkan arsitektur jaringan saraf berulang (*Recurrent Neural Networks*).

---

## 1. Arsitektur Recurrent Neural Network (RNN)

RNN memproses token urutan satu per satu sambil mempertahankan status tersembunyi (*hidden state* $h_t$) sebagai representasi memori:
$$h_t = \tanh(W_{hh} h_{t-1} + W_{xh} x_t + b_h)$$
$$y_t = \text{softmax}(W_{hy} h_t + b_y)$$

### Kelemahan RNN Klasik:
Saat deret teks cukup panjang ($> 15$ kata), perkalian matriks berulang dalam *Backpropagation Through Time* (BPTT) menyebabkan gradien menyusut secara eksponensial (**Vanishing Gradient**) atau meledak (**Exploding Gradient**), sehingga RNN lupa konteks awal kalimat.

---

## 2. Arsitektur Long Short-Term Memory (LSTM)

LSTM mengatasi masalah gradien lenyap dengan memperkenalkan **Cell State ($C_t$)** sebagai jalan tol informasi yang diatur oleh tiga mekanisme pintu (*gates*):

1. **Forget Gate ($f_t$)**: Menentukan informasi apa dari status sel lama yang harus dibuang:
   $$f_t = \sigma(W_f [h_{t-1}, x_t] + b_f)$$
2. **Input Gate ($i_t$)**: Menentukan informasi baru apa yang akan disimpan ke dalam status sel:
   $$i_t = \sigma(W_i [h_{t-1}, x_t] + b_i)$$
   $$\tilde{C}_t = \tanh(W_c [h_{t-1}, x_t] + b_c)$$
   $$C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t$$
3. **Output Gate ($o_t$)**: Menentukan hidden state output berdasarkan status sel yang telah diperbarui:
   $$o_t = \sigma(W_o [h_{t-1}, x_t] + b_o)$$
   $$h_t = o_t \odot \tanh(C_t)$$

---

## 3. Implementasi Analisis Sentimen PyTorch

```python
import torch
import torch.nn as nn

class SentimentLSTM(nn.Module):
    def __init__(self, vocab_size: int, embed_dim: int, hidden_dim: int, num_classes: int = 2):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True)
        self.fc = nn.Linear(hidden_dim, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        embedded = self.embedding(x)
        out, (hn, cn) = self.lstm(embedded)
        # Gunakan status tersembunyi terakhir untuk klasifikasi
        return self.fc(hn[-1])
```