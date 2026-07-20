## Hint 1
Same predicate, different indexed column: the ORDER BY column. Lesson
35's "index provides the order" plus this lesson's "only pending rows".

## Hint 2
```sql
CREATE INDEX orders_pending_created_idx
  ON orders (created_at)
  WHERE status = 'pending';
```
