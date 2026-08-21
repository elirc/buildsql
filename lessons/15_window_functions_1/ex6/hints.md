## Hint 1
Windows are computed after WHERE but before the outer query can filter
on them - so number the rows in a CTE and filter `rn = 1` outside.

## Hint 2
`row_number() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) AS rn`, then `WHERE rn = 1`.
