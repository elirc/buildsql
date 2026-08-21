## Hint 1
This is three different reports in one result: revenue by category, revenue by
status, and the grand total. `GROUPING SETS` lets you list exactly the
groupings you want — no more, no less — instead of running three queries and
`UNION`-ing them.

## Hint 2
First get the join right — line-item revenue needs the product (for category)
and the order (for status):

```sql
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders   o ON o.id = oi.order_id
```

Then list the three groupings: `GROUP BY GROUPING SETS ((p.category),
(o.status), ())`. The empty `()` is the grand total.

## Hint 3
Revenue is `sum(oi.quantity * oi.price)`. Select `p.category, o.status,
sum(...)`. Category rows come back with `status` NULL, status rows with
`category` NULL, and the `()` set produces one row with both NULL. Eleven rows
total; you don't have to order them.
