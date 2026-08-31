## Hint 1
You are looking for an absence: no paid order anywhere in this customer's history. Customers with cancelled or pending orders still qualify, and so do customers with no orders at all.

## Hint 2
Two spellings do this. `NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'paid')`, or a `LEFT JOIN` carrying `o.status = 'paid'` in its `ON` clause followed by `WHERE o.id IS NULL`. Note where the status test has to sit in the second one.
