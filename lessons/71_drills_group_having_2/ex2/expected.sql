SELECT status,
       date_trunc('quarter', created_at) AS quarter,
       count(*) AS orders,
       round(sum(total), 2) AS revenue
FROM orders
GROUP BY status, 2
ORDER BY status, quarter;
