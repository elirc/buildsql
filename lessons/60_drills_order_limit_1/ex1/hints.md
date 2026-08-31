## Hint 1
Earliest first is the default direction. The second key exists only to
settle ties on the first.

## Hint 2
```sql
ORDER BY hired_on ASC, id ASC
LIMIT 10
```

Without the `id` key, two people hired on the same day could come back in
either order, and the gate compares positions.
