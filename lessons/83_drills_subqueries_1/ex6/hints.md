## Hint 1
A subquery can also stand where a table stands. Aggregate the orders into one row per customer first, give that result a name, and then filter it as if it were a table.

## Hint 2
`FROM (SELECT customer_id, count(*) AS orders, sum(total) AS revenue FROM orders WHERE status <> 'cancelled' GROUP BY customer_id) t` - and now `WHERE t.orders >= 15` is a plain `WHERE`, because at this level `orders` is just a column. The `HAVING` version of the same query is equally correct; write both and decide which you find easier to read.
