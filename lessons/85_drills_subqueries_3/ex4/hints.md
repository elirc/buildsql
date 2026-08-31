## Hint 1

"How many people does this row manage" is a correlated count over `staff` again, matching `manager_id` to the outer row's `id`.

## Hint 2

`ORDER BY` accepts any expression, not just output columns - put the whole `(SELECT count(*) ...)` in the `ORDER BY` clause, follow it with `DESC`, and add `s.id` as the tie-break.
