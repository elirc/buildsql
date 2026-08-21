CREATE INDEX order_items_order_price_incl_idx ON order_items (order_id) INCLUDE (price);
