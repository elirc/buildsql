## Hint 1

You are not filtering here - every member of `sales` comes back. The question is what to put in the fourth column.

## Hint 2

`EXISTS (...)` is a boolean expression, so it belongs in the `SELECT` list just like any other value. Correlate it on `r.manager_id = s.id`.
