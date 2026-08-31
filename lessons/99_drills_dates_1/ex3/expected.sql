SELECT date_trunc('quarter', created_at) AS quarter,
       count(*) AS orders,
       round(sum(total), 2) AS revenue
FROM orders
GROUP BY date_trunc('quarter', created_at)
ORDER BY quarter;
