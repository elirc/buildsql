## Hint 1
One row per status, so `orders.status` is the grouping column. `customers` is in the query for one reason only - to supply the country filter.

## Hint 2
Join the two tables, filter on the country and the half-open date range, then `GROUP BY o.status`. Half-open (`>= '2023-09-01' AND < '2023-10-01'`) is what keeps a midnight order out of two months at once.
