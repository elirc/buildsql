## Hint 1

Two independent conditions about two different tables, joined by `AND` in the same `WHERE` clause - one negative, one positive.

## Hint 2

`NOT EXISTS` against `order_items` on `oi.product_id = p.id`, and `EXISTS` against `reviews` on `r.product_id = p.id AND r.rating = 5`. Keep them as separate subqueries; combining the two tables inside one subquery asks a much weaker question.
