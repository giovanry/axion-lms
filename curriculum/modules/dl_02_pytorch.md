# PyTorch Neural Network Implementation & CUDA Acceleration

## Tensor Allocation on Hardware Accelerators

In PyTorch, tensors can reside on CPU RAM or GPU VRAM. CUDA tensors execute mathematical kernels directly on NVIDIA streaming multiprocessors (e.g. RTX 3050 CUDA cores).

```python
import torch

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Allocating computation graph on: {device}")

# Move tensor to GPU memory
x = torch.randn(1024, 1024, device=device)
w = torch.randn(1024, 1024, device=device, requires_grad=True)
y = torch.matmul(x, w)
```

## Loss Function: Mean Squared Error

Mean Squared Error (MSE) measures the average squared difference between predictions and target labels:

$$\text{MSE}(y, \hat{y}) = \frac{1}{N} \sum_{i=1}^N (y_i - \hat{y}_i)^2$$

## Challenge
Implement `compute_mse_loss(y_pred, y_true)` returning the scalar MSE float rounded to 4 decimal places.
