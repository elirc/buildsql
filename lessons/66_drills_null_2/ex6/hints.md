## Hint 1

Join `staff` to itself with a LEFT JOIN so that people who manage nobody survive the join, then group by the manager's id.

## Hint 2

For an unmatched row the right-hand side is entirely NULL, so `count(r.id)` is 0 while `sum(r.salary)` is NULL. Only one of those two needs a `coalesce`.
