## Hint 1

Two levels of grouping. The inner query produces one row per customer with their order count; the outer query groups those rows by a CASE over that count.

## Hint 2

In the outer query, `count(*)` counts customers, because one row of the inner result is one customer. Getting that straight is the whole exercise.
