## Hint 1

`coalesce(a, b)` returns the first argument that is not NULL. All of its arguments must share one type, and `manager_id` is an integer while `'none'` is text.

## Hint 2

Cast before you substitute: `coalesce(manager_id::text, 'none')`. Writing `coalesce(manager_id, 'none')` asks PostgreSQL to turn 'none' into an integer, and it will tell you so.
