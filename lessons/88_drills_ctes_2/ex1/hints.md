## Hint 1

There are only six category averages in the whole database. Compute them once, in their own step, and treat them as a small lookup table.

## Hint 2

`WITH category_avg AS (SELECT category, avg(price) AS avg_price FROM products GROUP BY category)`, then join `products` to it on `category` and filter with `p.price > a.avg_price`. The `IN ('books', 'electronics')` restriction belongs to the outer query, not to the CTE.
