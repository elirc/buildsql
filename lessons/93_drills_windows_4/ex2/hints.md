## Hint 1

You cannot group by a bucket in the same query that computes it - the window runs after `GROUP BY`.

## Hint 2

Compute `ntile(4) OVER (ORDER BY salary DESC, id)` alongside `salary` in a CTE or derived table, then group that by the bucket.
