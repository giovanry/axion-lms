# Memory Model & Vectorized Operations in Python

## Python Object References

In Python, variables do not store values directly. Instead, variables are symbolic names bound to objects stored in memory. Every object contains three intrinsic properties:

1. **Identity:** A unique integer corresponding to its memory location, accessible via `id(obj)`.
2. **Type:** Defines supported operations and valid state ranges, accessible via `type(obj)`.
3. **Value:** The underlying data represented by the object.

```python
a = [1, 2, 3]
b = a
b.append(4)
print(a)  # Outputs [1, 2, 3, 4] because both symbols reference the same list
```

## Algorithmic Challenge: Parity Counter

Implement the function `find_parity_pairs(numbers)` in the editor pane. The function must scan the incoming list of integers and return a 2-tuple:

$$(count_{even}, count_{odd})$$

### Constraints
- $0 \le len(numbers) \le 10^5$
- Target time complexity: $O(N)$
- Target space complexity: $O(1)$ auxiliary
