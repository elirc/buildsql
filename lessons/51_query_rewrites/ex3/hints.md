## Hint 1
The two arms of the `OR` filter different tables, so the executor must
materialize the whole join before it can test either. Each arm *on its
own* is a fast, index-friendly query. Run them separately and combine.

## Hint 2
`UNION` (lesson 11) glues the arms and deduplicates. Arm one doesn't
need `customers` at all — every order has a customer, so the join adds
nothing to `WHERE o.total > 1995`. Arm two keeps the join but filters
only on `c.email`.

## Hint 3
```sql
SELECT o.id, o.total
FROM orders o
WHERE o.total > 1995
UNION
SELECT o.id, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE c.email = ...;
```
Why `UNION` and not `UNION ALL`? If that customer *also* has an order
over 1995, both arms produce it — the original emitted it once.
