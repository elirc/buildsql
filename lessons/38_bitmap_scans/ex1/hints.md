## Hint 1
Two CREATE INDEX statements: one on each column in the OR. Postgres
does the combining - you just have to make both sides indexable.

## Hint 2
```sql
CREATE INDEX orders_customer_id_idx ON orders (customer_id);
CREATE INDEX orders_total_idx ON orders (total);
```
