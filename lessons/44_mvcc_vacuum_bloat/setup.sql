-- A 100k-row workbench with autovacuum off: dead tuples stay until YOU act.
CREATE TABLE bloat_orders (LIKE orders INCLUDING ALL)
  WITH (autovacuum_enabled = false);

INSERT INTO bloat_orders SELECT * FROM orders WHERE id <= 100000;
