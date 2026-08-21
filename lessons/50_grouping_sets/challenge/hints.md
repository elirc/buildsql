## Hint 1
`ROLLUP (category, status)` builds a hierarchy: every (category, status) pair,
then a subtotal per category, then one grand total — 6×4 + 6 + 1 = 31 rows.
Notice what it does *not* give you: a subtotal per status on its own (that
would need `CUBE` or an explicit `GROUPING SETS`). The point of this exercise
is to see the difference.

## Hint 2
The subtotal and grand-total rows carry `NULL` in the rolled-up column, which
looks identical to a real NULL. `GROUPING(status)` disambiguates: it returns
`1` when the row is aggregated *over* status (a subtotal), `0` when `status` is
a genuine value.

```sql
SELECT p.category, o.status, sum(oi.quantity * oi.price) AS revenue,
       GROUPING(o.status) AS is_subtotal
FROM ...
GROUP BY ROLLUP (p.category, o.status);
```

## Hint 3
Use the same three-table join as exercise 2. The `is_subtotal` column is
literally `GROUPING(o.status)` — return it as-is (0 or 1). Don't filter
anything out; the gate expects all 31 rows.
