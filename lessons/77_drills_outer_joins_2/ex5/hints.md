## Hint 1
Two counts over two disjoint subsets of the same customer's orders. There are two natural shapes - one join with two filtered aggregates, or two separate outer joins - and only one of them is safe by default.

## Hint 2
If you attach `orders` twice, a customer with 5 paid and 2 cancelled orders gets 10 rows, and every plain count reports 10. The repair for a count is `count(DISTINCT ...)`; the way to avoid the problem entirely is a single `LEFT JOIN` with `FILTER (WHERE ...)` on each aggregate.
