## Hint 1

Group first, rank second. By the time the window runs, the six category rows already exist.

## Hint 2

`rank() OVER (ORDER BY count(*) DESC)` in the same `SELECT` as `GROUP BY category` - a window function is allowed to take an aggregate as its argument.
