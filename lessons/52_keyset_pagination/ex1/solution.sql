-- 52_keyset_pagination/ex1: this is the slow query - rewrite it (README "Exercise 1").
-- The index is already right. Same 20 rows, same order, without walking the
-- 200,000 rows the OFFSET throws away.
SELECT id, ts
FROM events
WHERE ts >= TIMESTAMPTZ '2023-11-11 12:00:00+00'
ORDER BY ts
OFFSET 200000
LIMIT 20;
