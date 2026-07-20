## Hint 1
Index `(total)`, but only for rows `WHERE status = 'pending'` - the
WHERE goes on the CREATE INDEX itself, after the column list.

## Hint 2
```sql
CREATE INDEX orders_pending_total_idx
  ON orders (total)
  WHERE status = 'pending';
```
