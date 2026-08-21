## Hint 1
Two things have to happen per category and in this order: first pick the five
most expensive products, *then* average their prices. You cannot do that with
one flat `AVG(...) ... GROUP BY category` — an aggregate over the whole
category averages all ~1,600 rows, not just the top five. You need a per-group
`LIMIT` before the average, which means a lateral subquery.

## Hint 2
Nest two subqueries inside the LATERAL: the inner one selects the five
highest prices for the current category (`ORDER BY price DESC, id LIMIT 5`),
and the outer one averages them.

```sql
... CROSS JOIN LATERAL (
    SELECT avg(price) FROM (
        SELECT price FROM products p
        WHERE p.category = c.category
        ORDER BY price DESC, id LIMIT 5
    ) x
) t
```

## Hint 3
Wrap it up: `SELECT c.category, round(t.avg_top5, 2)` and give the inner
`avg(price)` the alias `avg_top5`. Round to 2 decimals so the numbers line up
with the gate.
