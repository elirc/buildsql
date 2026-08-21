## Hint 1
Three items in the SELECT list. The third wraps `manager_id` in
`coalesce(...)` with the fallback as the second argument.

## Hint 2
`SELECT id, name, coalesce(manager_id, 0) AS manager_or_zero FROM staff;`
