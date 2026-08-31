## Hint 1
One table, two roles: a staff row is a leaf when no other staff row points at it as a manager. So the table has to appear twice, and the second appearance is the thing that must not exist.

## Hint 2
The obvious spelling is `WHERE s.id NOT IN (SELECT manager_id FROM staff)`. Run it: it returns nothing at all. `manager_id` is NULL for the CEO, and `NOT IN` against a list containing NULL can never be true - `x <> NULL` is unknown, so the whole conjunction is unknown for every row.

## Hint 3
Use `NOT EXISTS (SELECT 1 FROM staff r WHERE r.manager_id = s.id)`, which compares row by row and treats a non-matching NULL as simply not a match. The `LEFT JOIN ... WHERE r.id IS NULL` anti-join spelling is equally safe. If you must keep `NOT IN`, the fix is `WHERE manager_id IS NOT NULL` inside the subquery.
