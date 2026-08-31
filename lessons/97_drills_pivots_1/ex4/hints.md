## Hint 1

`FILTER` is not a `count` feature - it attaches to any aggregate, `sum`
included. One column per side of the 2023-01-01 boundary.

## Hint 2

`round(sum(total) FILTER (WHERE created_at < DATE '2023-01-01'), 2)` and the
mirror image with `>=`. Round the sum, not the individual totals.
