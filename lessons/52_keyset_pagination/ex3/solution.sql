-- 52_keyset_pagination/ex3: this is the slow query - rewrite it (README "Exercise 3").
-- Newest first this time. Same 20 rows, same order, no OFFSET.
SELECT id, ts
FROM events
ORDER BY ts DESC
OFFSET 200000
LIMIT 20;
