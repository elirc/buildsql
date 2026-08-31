SELECT nullif(status, 'cancelled') AS live_status,
       count(*) AS orders,
       sum(total) AS revenue
FROM orders
GROUP BY 1
ORDER BY 1 NULLS FIRST;
