## Hint 1
The threshold is the average number of orders **per customer**, which means the per-customer counts have to exist before the average can be taken. Two levels of aggregation, one inside the other.

## Hint 2
`HAVING count(*) > (SELECT avg(n) FROM (SELECT count(*) AS n FROM orders WHERE ... GROUP BY customer_id) t)`. The inner derived table is what turns a set of groups into a set of rows that can themselves be averaged - you cannot write `avg(count(*))`.

## Hint 3
A CTE says the same thing more legibly: name the per-customer counts once, then select from it and compare against an average taken over it. Both spellings compute the aggregation twice; the CTE just makes it obvious that the two are the same computation.
