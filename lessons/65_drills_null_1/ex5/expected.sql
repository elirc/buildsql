SELECT count(*) AS n,
       sum(total) AS revenue,
       coalesce(sum(total), 0) AS revenue_or_zero,
       max(created_at) AS newest
FROM orders
WHERE status = 'refunded';
