## Hint 1

No filtering on the window results here - every review of product 42 comes back, with three extra columns showing how the three functions differ.

## Hint 2

`rank()` and `dense_rank()` share the window `(ORDER BY rating DESC)`; `row_number()` needs `id` added to its ordering, or the numbers it produces are not reproducible between runs.
