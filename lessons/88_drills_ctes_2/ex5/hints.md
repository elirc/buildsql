## Hint 1

Compute the monthly series once, then join that series to itself - one copy playing "this month", the other playing "last month".

## Hint 2

`FROM monthly cur LEFT JOIN monthly prev ON prev.month = cur.month - INTERVAL '1 month'`. Use a `LEFT JOIN` so the earliest month survives with a `NULL` on the right.
