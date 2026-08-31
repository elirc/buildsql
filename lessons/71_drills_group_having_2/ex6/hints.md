## Hint 1

`extract(field FROM timestamp)` pulls out one calendar component. `isodow` numbers Monday to Sunday as 1 to 7; plain `dow` numbers Sunday as 0, which would change your row order.

## Hint 2

Seven groups, and the expression goes in both the SELECT list and the `GROUP BY`.
