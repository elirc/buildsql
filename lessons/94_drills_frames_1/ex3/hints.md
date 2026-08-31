## Hint 1

Both columns use the same frame: everything from the beginning of the series up to and including this row.

## Hint 2

`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, once with `sum(revenue)` and once with `max(revenue)`. The `max` version is a high-water mark, which is not the same as the maximum of the whole series.
