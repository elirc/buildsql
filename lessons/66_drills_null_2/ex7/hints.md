## Hint 1

`WHERE manager_id IS NULL` would answer a different question: it would throw away the rows you need for `headcount` before the group is formed.

## Hint 2

`HAVING count(*) <> count(manager_id)` is true exactly when the group contains at least one NULL in that column. The `rootless` column itself can be built with `count(*) FILTER (WHERE ...)`.
