SELECT count(*) AS n,
       sum(total) AS revenue,
       CASE WHEN sum(total) IS NULL THEN 0 ELSE sum(total) END AS revenue_or_zero,
       max(created_at) AS newest
FROM orders
WHERE status = 'refunded';
