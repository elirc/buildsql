## Hint 1
Two Seq Scans, two missing indexes: orders is filtered on customer_id
(lesson 31's very first index), and order_items is joined on order_id
(lesson 33's unindexed FK). products is fine as-is.

## Hint 2
```sql
CREATE INDEX orders_customer_id_idx ON orders (customer_id);
CREATE INDEX order_items_order_id_idx ON order_items (order_id);
```
