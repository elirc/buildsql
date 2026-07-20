-- A copy of orders with autovacuum (and therefore auto-ANALYZE) disabled,
-- built AFTER the template's global VACUUM ANALYZE - so it has NO statistics.
CREATE TABLE hot_orders (LIKE orders INCLUDING ALL) WITH (autovacuum_enabled = false);

INSERT INTO hot_orders SELECT * FROM orders;

-- a rare status the planner can only know about via fresh stats
INSERT INTO hot_orders
SELECT id + 1000000, customer_id, 'refunded', total, created_at
FROM orders WHERE id <= 500;
