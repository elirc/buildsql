## Hint 1
"No manager" means the `manager_id` column is absent — NULL. Remember the
one operator that legitimately tests for NULL (it is not `=`).

## Hint 2
`WHERE manager_id IS NULL` — build the full two-column query on `staff`
around it.
