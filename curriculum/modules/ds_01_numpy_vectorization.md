# NumPy Matrix Multiplication & Broadcasting

## Contiguous Memory & SIMD Acceleration

Standard Python lists store arrays of pointers to individual boxed integer objects. In contrast, NumPy stores dense, contiguous blocks of homogeneous numeric types in memory (`C-contiguous` or `F-contiguous`).

This contiguous representation enables:
- Cache locality (maximizing L1/L2 cache line hits).
- SIMD (Single Instruction Multiple Data) register execution via modern CPU vector units (AVX-512, AVX2).

## Standardization Formula (Z-Score)

Feature standardization transforms numeric columns so that their distribution has a mean $\mu = 0$ and standard deviation $\sigma = 1$:

$$x' = \frac{x - \mu}{\sigma}$$

Where:
- $\mu = \frac{1}{N} \sum_{i=1}^N x_i$
- $\sigma = \sqrt{\frac{1}{N} \sum_{i=1}^N (x_i - \mu)^2}$

## Coding Challenge

Implement `normalize_features(matrix)` in the right editor pane. Your function will receive a 2D NumPy array and must normalize each column independently according to the formula above.
