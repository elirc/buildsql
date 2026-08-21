## Hint 1
Apply the lesson's rewrites one at a time, checking rows after each:
the `date_trunc` becomes a half-open range (ex1), the cross-table `OR`
becomes a `UNION` of two arms (ex3), and each arm asks its question
with a semi-join instead of join-plus-`DISTINCT` (ex4).

## Hint 2
Arm one: customers with an order in the June 15th range — `c.id IN
(SELECT o.customer_id FROM orders o WHERE o.created_at >= … AND
o.created_at < …)`. Arm two: the customer with that email. `UNION`
deduplicates between the arms.

## Hint 3
The wrinkle: in the original, the `JOIN` means the VIP appears only
because they *have orders*. A faithful arm two is

```sql
SELECT c.id, c.name
FROM customers c
WHERE c.email = 'user4242@example.com'
  AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)
```

— the `EXISTS` costs one index probe and keeps the rewrite honest for
a VIP who never ordered.
