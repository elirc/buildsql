## Hint 1
Three different subquery jobs in one statement: a company-wide number used as a threshold, a per-group filter on an aggregate, and a single name that no aggregate can produce.

## Hint 2
The threshold is an uncorrelated scalar subquery, `(SELECT avg(salary) FROM staff)`, and because the restriction is on the group's average it has to sit in `HAVING`, not `WHERE`.

## Hint 3
For the name, a correlated subquery in the `SELECT` list may reference the grouping column - `WHERE t.department = s.department` is legal because `s.department` is fixed within the group - ordered by `salary DESC, id` with `LIMIT 1`. `max(name)` would return the alphabetically last name and is the trap here.
