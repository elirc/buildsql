SELECT status, count(*) AS orders, round(avg(total), 2) AS avg_total
FROM orders
WHERE created_at >= '2023-10-01'
GROUP BY status
ORDER BY status;
