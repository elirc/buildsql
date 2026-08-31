## Hint 1
Three spellings work here: `NOT (...)`, `<>`, and `NOT IN (...)`. Pick
one.

## Hint 2
This is safe today only because `staff.department` is declared `NOT
NULL`. On a nullable column the same predicate would silently drop every
NULL row, because `NULL <> 'sales'` is unknown, not true.
