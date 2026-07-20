-- provided (someone else's query depends on it - keep it):
CREATE INDEX order_items_order_product_idx
  ON order_items (order_id, product_id);

-- add what ex2's query actually needs below:
