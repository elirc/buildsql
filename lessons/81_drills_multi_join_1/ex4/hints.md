## Hint 1
Three measures with three different definitions over the same group: one counts customers, one counts orders, one sums a subset of the orders. Only one join, and no `WHERE` on the status.

## Hint 2
`count(DISTINCT o.customer_id)` for the buyers - a country with 200 orders from 30 people has 30 buyers. `count(*)` for the orders, cancelled ones included. And `sum(o.total) FILTER (WHERE o.status <> 'cancelled')` for the revenue, so the exclusion applies to that measure alone.
