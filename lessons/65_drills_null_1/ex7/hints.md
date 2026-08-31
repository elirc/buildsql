## Hint 1

`x NOT IN (a, b, NULL)` expands to `x <> a AND x <> b AND x <> NULL`. That last conjunct is never true, so the whole expression is never true - it is either false or unknown, and both are rejected.

## Hint 2

Two ways out, and both are worth writing once: filter the NULLs out of the subquery with `WHERE manager_id IS NOT NULL`, or switch to `NOT EXISTS`, which asks about row existence instead of value equality.
