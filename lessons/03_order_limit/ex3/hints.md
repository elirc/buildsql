## Hint 1
"Page 3, 10 per page" = skip 2 pages of 10, take 10: OFFSET and LIMIT
together. "Newest first" means descending on the signup timestamp.

## Hint 2
```sql
ORDER BY created_at DESC, id DESC
OFFSET 20 LIMIT 10;
```

(Both `OFFSET 20 LIMIT 10` and `LIMIT 10 OFFSET 20` parse; Postgres doesn't
care about the order of the two clauses.)
