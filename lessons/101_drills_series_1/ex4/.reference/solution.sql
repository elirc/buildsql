WITH slots AS (
  SELECT g AS slot
  FROM generate_series(TIMESTAMPTZ '2023-05-10 00:00', TIMESTAMPTZ '2023-05-10 23:00',
                       interval '1 hour') AS g)
SELECT extract(hour FROM s.slot)::int AS hour,
       count(o.id) AS orders
FROM slots s
LEFT JOIN orders o ON date_trunc('hour', o.created_at) = s.slot
GROUP BY 1
ORDER BY 1;
