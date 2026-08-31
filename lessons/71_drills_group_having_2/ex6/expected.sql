SELECT extract(isodow FROM created_at) AS weekday,
       count(*) AS orders,
       round(avg(total), 2) AS avg_total
FROM orders
GROUP BY 1
ORDER BY 1;
