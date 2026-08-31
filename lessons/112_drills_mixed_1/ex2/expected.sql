SELECT extract(isodow FROM created_at)::int AS dow,
       count(*) AS orders,
       extract(isodow FROM created_at)::int >= 6 AS is_weekend
FROM orders
GROUP BY extract(isodow FROM created_at)::int
ORDER BY dow;
