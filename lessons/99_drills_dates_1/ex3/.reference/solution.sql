SELECT date_trunc('quarter', created_at) AS quarter,
       count(id) AS orders,
       round(sum(total), 2) AS revenue
FROM orders
GROUP BY 1
ORDER BY 1;
