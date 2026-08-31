## Hint 1
An inner join can only ever return customers who have at least one order. The prompt wants every Spanish customer, including the ones who have never bought anything, so the join has to keep the left side whole.

## Hint 2
`FROM customers c LEFT JOIN orders o ON o.customer_id = c.id`, then group by the customer. Now think hard about which count you write: a customer with no orders still produces one row, so one of `count(*)` and `count(o.id)` reports 1 and the other reports 0.
