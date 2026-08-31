## Hint 1

One row per distinct value of `country`, so `country` is the grouping key and everything else in the SELECT list must be an aggregate.

## Hint 2

`GROUP BY country` and then `ORDER BY country` - grouping does not sort, and the order you get without an ORDER BY is an accident of the algorithm.
