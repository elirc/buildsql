## Hint 1
The employee and the manager are both rows of `staff`. One table, two roles - so the table has to appear twice in the `FROM`, under two different aliases.

## Hint 2
`FROM staff e JOIN staff m ON m.id = e.manager_id`. Every column in the `SELECT` list has to say which copy it came from; `name` on its own is ambiguous and Postgres will say so.
