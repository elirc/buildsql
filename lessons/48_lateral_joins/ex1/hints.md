## Hint 1
You need the three most expensive products *within each category*. A plain
`ORDER BY price DESC LIMIT 3` gives you three products for the whole table,
not three per category. You want the `LIMIT` to run once per category — that
is exactly what a LATERAL subquery lets you do.

## Hint 2
Start from the list of distinct categories, then join each one to a subquery
that can see the current category and returns its top three:

```sql
SELECT c.category, t.name, t.price
FROM (SELECT DISTINCT category FROM products) c
CROSS JOIN LATERAL (
    SELECT name, price FROM products p
    WHERE p.category = c.category   -- references the outer row: this needs LATERAL
    ORDER BY price DESC, id
    LIMIT ...
) t;
```

## Hint 3
Set the `LIMIT` to 3. The `WHERE p.category = c.category` correlation is what
makes the subquery lateral — without `LATERAL` (or the implicit `LATERAL` that
`CROSS JOIN LATERAL` supplies) Postgres would reject the reference to `c`.
Break price ties with `id` so the "top three" is well defined.
