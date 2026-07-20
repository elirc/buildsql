## Hint 1
Two hats: `me` (pinned to id 42) and `t` (the teammates). Join them on
having the same manager, exclude the row where the teammate *is* me.

## Hint 2
```sql
SELECT t.id, t.name
FROM staff me
JOIN staff t ON t.manager_id = me.manager_id AND t.id <> me.id
WHERE me.id = 42;
```
