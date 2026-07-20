CREATE INDEX orders_paid_created_idx
  ON orders (created_at) INCLUDE (total)
  WHERE status = 'paid';
