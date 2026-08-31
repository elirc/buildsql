## Hint 1

Plain `=` cannot do this: staff member 1 has no manager, so `manager_id = (that subquery)` is NULL for every row and the filter keeps nothing.

## Hint 2

`a IS NOT DISTINCT FROM b` is the NULL-safe equality operator - true when both sides are equal and also true when both sides are NULL.
