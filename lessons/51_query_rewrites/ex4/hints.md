## Hint 1
The question is "does at least one order item exist for this
product?" — a yes/no per product, not a list of its line items. When
a `DISTINCT` exists only to undo a join's duplication, the join was
the wrong tool. Lesson 13's `EXISTS` asks the question directly.

## Hint 2
Keep `products` as the only table in `FROM`; move `order_items` into a
correlated `EXISTS` subquery:

```sql
SELECT p.id, p.name
FROM products p
WHERE p.category = 'garden'
  AND EXISTS (SELECT 1 FROM order_items oi WHERE ...);
```

The `...` correlates on the product id. With the provided index,
each product costs one probe that stops at the first hit — and since
no duplicates are ever produced, `DISTINCT` (and the gate's forbidden
`HashAggregate`/`Unique` nodes) disappear.
