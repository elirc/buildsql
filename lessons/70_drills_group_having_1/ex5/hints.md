## Hint 1

Two filters that look similar and are not: the date restricts which orders count, and the order count restricts which customers appear. One is a row filter, the other a group filter.

## Hint 2

`WHERE created_at >= DATE '2023-01-01' ... GROUP BY customer_id HAVING count(*) > 15` - and note that the count in `HAVING` counts only the rows that survived `WHERE`.
