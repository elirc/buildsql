## Hint 1

A weighted average is one division of two sums: total value over total weight. Do not average a ratio - `avg(quantity * price / quantity)` is just `avg(price)` again.

## Hint 2

`sum(quantity)` is a bigint, and dividing numeric by bigint stays numeric, so no cast is needed here. Round to 4 as the prompt asks, not 2.
