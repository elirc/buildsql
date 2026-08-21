## Hint 1
Do not try to write it as one `SELECT`. Sketch the report as two independent
results -- the per-country measures, and the per-country top customer --
then join them on `country` at the end. That decomposition is most of what
is being assessed.

## Hint 2
Measures: one `GROUP BY c.country` over `customers` joined to `orders`,
using `FILTER (WHERE o.status <> 'cancelled')` on the money columns while
`count(*)` stays over every order. Top customer: group by
`(country, customer)`, rank with `row_number() OVER (PARTITION BY country
ORDER BY sum(o.total) DESC, c.id)`, keep `rn = 1`.

## Hint 3
Three things that decide whether the numbers are right. `100.0`, not `100`,
or integer division floors your cancel rate to a whole number. `avg(total)
FILTER (...)` averages only the non-cancelled orders while `count(*)` counts
all of them -- read the spec once more and check which measure excludes
what. And `count(DISTINCT o.customer_id)` counts buyers, whereas `count(*)`
counts orders; mixing them up is the single most common way this report goes
out wrong.
