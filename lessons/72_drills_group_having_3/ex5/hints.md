## Hint 1

`HAVING` takes a full boolean expression, so two aggregate conditions can be combined with `AND` exactly as they would be in a `WHERE` clause.

## Hint 2

Compare against the unrounded average. `round(avg(total), 2) > 1200` would behave differently for a customer sitting at 1199.996.
