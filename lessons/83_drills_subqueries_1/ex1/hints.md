## Hint 1
The threshold is a single number that has to be computed from the same table you are filtering, and it is the same number for every row - so it can be worked out once, before any comparison happens.

## Hint 2
A scalar subquery is a parenthesised `SELECT` returning exactly one row and one column, and it can appear anywhere a value can: `WHERE price > (SELECT avg(price) FROM products WHERE category = 'toys')`. Note that the subquery needs its own category filter - it does not inherit the outer query's `WHERE`.
