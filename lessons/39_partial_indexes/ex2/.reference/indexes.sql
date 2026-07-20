CREATE INDEX orders_pending_created_idx
  ON orders (created_at)
  WHERE status = 'pending';
