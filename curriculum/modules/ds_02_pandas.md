# Pembersihan Data & Feature Engineering Pandas

## Strategi Penanganan Nilai Hilang (Missing Values)

Dalam analisis data nyata, dataset seringkali mengandung nilai tidak lengkap (`NaN` atau `None`).

### Imputasi Rata-rata (Mean Imputation)

Untuk variabel numerik kontinu, penggantian nilai hilang dengan rata-rata sampel:

$$\bar{x} = \frac{1}{|S_{\text{valid}}|} \sum_{i \in S_{\text{valid}}} x_i$$

### Tantangan Pemrograman

Lengkapi fungsi `impute_missing_with_mean(series_vals)` pada editor di samping. Ganti setiap nilai `None` dengan rata-rata elemen yang valid.
