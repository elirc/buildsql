## Hint 1

"This month and the two before" is three rows, and the frame bound counts only the ones before.

## Hint 2

`sum(orders) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` - `2 PRECEDING` plus the current row makes three.
