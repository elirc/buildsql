## Hint 1
Outer: orders, filtered to customer_id <= 10. Condition: this order's
created_at equals the maximum created_at *among this customer's orders* —
the inner query must reference the outer order's customer_id.

## Hint 2
```sql
SELECT o.customer_id, o.id, o.created_at
FROM orders o
WHERE o.customer_id <= 10
  AND o.created_at = (SELECT max(o2.created_at)
                      FROM orders o2
                      WHERE o2.customer_id = o.customer_id);
```

Lesson 15 solves this family with `row_number()` — compare once you get
there.
