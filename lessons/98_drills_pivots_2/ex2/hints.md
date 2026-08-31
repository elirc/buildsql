## Hint 1

The dimension on the columns is not a stored value - it is computed from the
timestamp. Everything else is the pivot you already know.

## Hint 2

`extract(dow FROM created_at)` gives 0 for Sunday through 6 for Saturday, so
the weekend predicate is `IN (0, 6)`. The weekday column is either the
negated predicate or `orders` minus `weekend`.
