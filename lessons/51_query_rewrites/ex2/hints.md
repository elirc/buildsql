## Hint 1
"Never placed an order" is an **anti-join**: keep each customer row
exactly when the probe for matching orders comes up empty. You built
this shape in lesson 09 (`LEFT JOIN … IS NULL`) and lesson 13
(`NOT EXISTS`). Either works; `NOT IN` is the one form the planner
refuses to turn into a join.

## Hint 2
Correlate the subquery on the customer id:

```sql
SELECT count(*) AS never_ordered
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE ...);
```

The `...` ties `o.customer_id` to `c.id`. Run `dojo plan
51_query_rewrites ex2` — you want a `Hash Anti Join` in the tree, not
a `SubPlan` hanging off a `Seq Scan`.
