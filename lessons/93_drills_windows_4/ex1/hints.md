## Hint 1

Each department gets its own four buckets, so the window needs a partition as well as an order.

## Hint 2

`ntile(4) OVER (PARTITION BY department ORDER BY salary DESC, id)`. The `id` in the ordering is not decoration - without it, colleagues on equal salaries land in buckets non-deterministically.
