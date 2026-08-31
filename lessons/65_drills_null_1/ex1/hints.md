## Hint 1

`IS NULL` and `IS NOT NULL` are not only filters. They are ordinary boolean expressions and can sit in the SELECT list like any other computation.

## Hint 2

`SELECT id, name, manager_id, <the test> AS has_manager FROM staff WHERE ... ORDER BY id;` - the test is the same three words you would put in a WHERE clause.
