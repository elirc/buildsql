## Hint 1
Search key: `product_id`. Payload: `price`. The README's second concept
block is this exact shape.

## Hint 2
```sql
CREATE INDEX order_items_product_incl_idx
  ON order_items (product_id) INCLUDE (price);
```
