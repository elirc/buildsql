## Hint 1
The interviewer's whole point is the row count. "Customers who have at least
one cancelled order" must return each customer once, whatever number of
cancelled orders they have. Which shape of query guarantees that?

## Hint 2
A semi-join: `FROM customers c WHERE c.country = 'JP' AND EXISTS (SELECT 1
FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')`.
Nothing from `orders` appears in the select list, so nothing can multiply.

## Hint 3
Write the naive join version in `dojo lab` first and count its rows -- it is
the mistake you are being immunised against. `IN (SELECT customer_id FROM
orders WHERE status = 'cancelled')` is also correct here, and worth saying
out loud why: `orders.customer_id` is `NOT NULL`, so the trap from ex1
cannot fire.
