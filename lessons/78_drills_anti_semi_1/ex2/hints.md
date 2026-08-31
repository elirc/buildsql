## Hint 1
This is the opposite of an anti-join: you want the customers for whom a matching row **does** exist, and you want each of them once no matter how many books they have bought.

## Hint 2
`EXISTS (SELECT 1 FROM orders o JOIN order_items oi ... JOIN products p ... WHERE o.customer_id = c.id AND p.category = 'books')` stops at the first match and cannot duplicate. A plain join through the three tables works too, but a customer with forty book lines then appears forty times unless you dedupe.
