# Backpropagation & The Chain Rule

## Mathematical Foundation

Backpropagation computes the gradient of the loss function with respect to each parameter in the computational graph. It relies directly on the **multivariate chain rule** of calculus.

### Scalar Formulation

Consider a single training sample passing through a dense layer followed by a non-linear activation:

$$z = w x + b$$

$$\hat{y} = \sigma(z) = \frac{1}{1 + e^{-z}}$$

For a mean squared error loss function:

$$L = \frac{1}{2} (y - \hat{y})^2$$

To calculate the gradient of the loss with respect to weight $w$, we apply the chain rule:

$$\frac{\partial L}{\partial w} = \frac{\partial L}{\partial \hat{y}} \cdot \frac{\partial \hat{y}}{\partial z} \cdot \frac{\partial z}{\partial w}$$

### Derivative Components

1. **Loss derivative with respect to prediction:**
   $$\frac{\partial L}{\partial \hat{y}} = - (y - \hat{y})$$

2. **Sigmoid activation derivative:**
   $$\frac{\partial \hat{y}}{\partial z} = \sigma(z)(1 - \sigma(z))$$

3. **Affine transformation derivative:**
   $$\frac{\partial z}{\partial w} = x$$

Combining these components yields:

$$\frac{\partial L}{\partial w} = -(y - \hat{y}) \cdot \sigma(z)(1 - \sigma(z)) \cdot x$$

## Weight Updates in Gradient Descent

Once the analytical gradient is computed, parameters are updated via gradient descent with learning rate $\eta$:

$$w \leftarrow w - \eta \frac{\partial L}{\partial w}$$

$$b \leftarrow b - \eta \frac{\partial L}{\partial b}$$
