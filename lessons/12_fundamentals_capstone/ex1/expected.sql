SELECT status, count(*), sum(total) FROM orders
WHERE created_at >= '2023-07-01' AND created_at < '2023-10-01'
GROUP BY status ORDER BY status;
