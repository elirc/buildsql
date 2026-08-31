## Hint 1

Only one of the two output columns needs recursion. Work out which, and get the other the ordinary way.

## Hint 2

Walk the tree carrying `department` and `depth`, then group by department for `max(depth)`. For `leaves`, count the rows for which `NOT EXISTS (SELECT 1 FROM staff r WHERE r.manager_id = ...)` - an aggregate `FILTER` clause keeps it in the same pass.
