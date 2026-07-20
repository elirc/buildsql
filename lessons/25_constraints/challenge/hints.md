## Hint 1
Composite PK syntax is a table-level clause: `PRIMARY KEY (customer_id,
product_id)` after the column list. Each column also carries its own
REFERENCES clause.

## Hint 2
```sql
CREATE TABLE wishlists (
  customer_id int NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id  int NOT NULL REFERENCES products(id),
  PRIMARY KEY (customer_id, product_id)
);
```
