-- 52_keyset_pagination/ex4: the query is already right (README "Exercise 4").
-- One customer's feed, keyset-paged. Leave it alone - the missing piece this
-- time is an index, and it goes in ex4/indexes.sql.
SELECT id, ts, event_type
FROM events
WHERE customer_id = 4242
  AND ts > TIMESTAMPTZ '2023-10-20 00:00:00+00'
ORDER BY ts
LIMIT 20;
