## Hint 1
The README hands you the broken query and names the culprit: the NULL
inside the `NOT IN` list. You can't fix `NOT IN`'s semantics, but you can
deny it the NULL.

## Hint 2
Add a WHERE clause *inside the parentheses* so the list is NULL-free:

```sql
... NOT IN (SELECT manager_id FROM staff WHERE manager_id IS NOT NULL)
```

## Hint 3
The full shape is the README's broken query plus that one inner WHERE.
Nothing else changes.
