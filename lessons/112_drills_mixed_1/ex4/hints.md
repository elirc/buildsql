## Hint 1

Two windows over the same partition: a row number down the salary ladder, and the partition's size. The middle rung is position (n + 1) / 2 with integer division - which needs both numbers on every row.

## Hint 2

row_number() OVER (PARTITION BY department ORDER BY salary DESC, id) and count(*) OVER (PARTITION BY department) in one CTE, then WHERE rn = (n + 1) / 2 outside - window results are invisible to the same query's WHERE.

## Hint 3

Check the arithmetic against tiny cases: n = 5 gives position 3 (the true middle), n = 4 gives position 2 (the upper of the middle pair) - integer division makes that choice for you, and the prompt adopts it. The id tie-break keeps "the" middle person stable when salaries repeat.
