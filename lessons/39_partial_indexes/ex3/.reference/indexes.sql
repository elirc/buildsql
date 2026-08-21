CREATE INDEX orders_cancelled_total_idx ON orders (total) WHERE status = 'cancelled';
