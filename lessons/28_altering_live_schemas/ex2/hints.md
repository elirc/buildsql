## Hint 1
Two ALTER TABLE statements: ADD CONSTRAINT orders_total_min CHECK (...)
NOT VALID, then VALIDATE CONSTRAINT orders_total_min. The constraint
name matters - the gate looks it up by name.

## Hint 2
```sql
ALTER TABLE orders
  ADD CONSTRAINT orders_total_min CHECK (total >= 5) NOT VALID;

ALTER TABLE orders VALIDATE CONSTRAINT orders_total_min;
```
