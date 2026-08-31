## Hint 1

Three averages over the same group: one unrestricted, two restricted to a
price band. `FILTER` is not limited to `count`.

## Hint 2

`round(avg(price) FILTER (WHERE price < 100), 2)` - and note that the rows
excluded by the filter are still part of the group, so `avg_price` sees all
of them.
