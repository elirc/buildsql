## Hint 1
The threshold is different for every row: each person is compared against the average of their own team, not against a company-wide number.

## Hint 2
That is a correlated scalar subquery - `(SELECT avg(t.salary) FROM staff t WHERE t.manager_id = s.manager_id)`, where `s` comes from the outer query. Exclude the CEO explicitly: their `manager_id` is NULL, so `t.manager_id = NULL` matches nothing, the average is NULL, and the comparison is unknown rather than false.
