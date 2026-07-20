CREATE INDEX orders_pending_total_idx
  ON orders (total)
  WHERE status = 'pending';
