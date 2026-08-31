## Hint 1

`nullif(a, b)` returns NULL when the two arguments are equal and `a` otherwise - the exact inverse of `coalesce`. Grouping by it therefore collapses one status into the NULL group.

## Hint 2

You can group by the expression itself or by its ordinal position (`GROUP BY 1`); PostgreSQL accepts both. The ordering needs `NULLS FIRST` because ascending order puts NULLs last by default.
