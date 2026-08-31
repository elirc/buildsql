## Hint 1

One row in, at most one row out: a LATERAL subquery with LIMIT 1 is a per-row lookup. The driving table is customers, the lookup is that customer's orders sorted the right way.

## Hint 2

Inside the LATERAL: WHERE o.customer_id = c.id ORDER BY o.total DESC, o.id LIMIT 1. Customers with no orders vanish because CROSS JOIN LATERAL behaves like an inner join - the prompt wants exactly that.
