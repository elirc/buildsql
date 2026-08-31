SELECT CASE WHEN status = 'cancelled' THEN NULL ELSE status END AS live_status,
       count(*) AS orders,
       sum(total) AS revenue
FROM orders
GROUP BY 1
ORDER BY 1 NULLS FIRST;
