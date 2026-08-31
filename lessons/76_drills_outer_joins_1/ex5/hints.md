## Hint 1
Two joins with two different jobs in one query. The customer is there only to supply a filter, so an order without a customer is impossible and that join can be inner. The lines are there to be counted, and an order with none of them still belongs in the report.

## Hint 2
`FROM orders o JOIN customers c ON ... LEFT JOIN order_items oi ON oi.order_id = o.id AND oi.quantity = 5`. Mixing inner and outer joins in one `FROM` is normal; what matters is that `quantity = 5` sits in the `ON` of the outer join, because in `WHERE` it would throw away every order that has no such line.
