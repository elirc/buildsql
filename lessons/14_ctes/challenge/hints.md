## Hint 1
Reverse the join direction: base case is `WHERE id = 442` with pos 1; the
step finds the row whose `id` equals the *current* row's `manager_id`,
pos + 1. Each step yields exactly one row until the CEO's NULL ends it.

## Hint 2
```sql
WITH RECURSIVE chain AS (
    SELECT id, name, manager_id, 1 AS pos
    FROM staff WHERE id = 442
    UNION ALL
    SELECT s.id, s.name, s.manager_id, chain.pos + 1
    FROM staff s
    JOIN chain ON s.id = chain.manager_id
)
SELECT pos, id, name FROM chain ORDER BY pos;
```

Note the CTE carries `manager_id` along even though the output doesn't —
the recursion needs it.
