## Hint 1
No WHERE clause at all. Three items in the SELECT list; the third is
plain arithmetic on a nullable column.

## Hint 2
`SELECT id, name, manager_id + 1000 AS mgr_code FROM staff;`
