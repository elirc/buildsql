## Hint 1
The predicates: equality on status, range on created_at. Lesson 39
says a partial index (WHERE status = 'paid') on created_at is the
tight fit; lesson 34 says INCLUDE (customer_id, total) might let it go
index-only. Start with the partial, measure, then try adding INCLUDE.

## Hint 2
```sql
CREATE INDEX orders_paid_created_idx
  ON orders (created_at) INCLUDE (customer_id, total)
  WHERE status = 'paid';
```

Compare `dojo plan` with and without the INCLUDE - the node type
changes. Either version passes; know why.
