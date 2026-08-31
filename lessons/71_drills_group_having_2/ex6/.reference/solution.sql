SELECT extract(isodow FROM created_at) AS weekday,
       count(*) AS orders,
       round(avg(total), 2) AS avg_total
FROM orders
GROUP BY extract(isodow FROM created_at)
ORDER BY extract(isodow FROM created_at);
