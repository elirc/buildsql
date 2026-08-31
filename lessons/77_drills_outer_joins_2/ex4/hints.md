## Hint 1
The thing you want to outer-join to is not a table, it is the result of joining two tables. An order qualifies for a NULL row when that combined result has nothing for it - which is a different condition from either table having nothing.

## Hint 2
Two shapes work. Wrap the inner join in parentheses and outer-join the whole thing: `LEFT JOIN (order_items oi JOIN products p ON ...) ON oi.order_id = o.id`. Or build the expensive lines in a subquery first and `LEFT JOIN` that. What does not work is joining the two tables one after another and hoping - a cheap line would give you a row you did not want.
