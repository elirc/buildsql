SELECT c.country,
       count(DISTINCT o.customer_id) AS buyers,
       count(*) AS orders,
       coalesce(sum(o.total) FILTER (WHERE o.status <> 'cancelled'), 0) AS revenue
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.country
ORDER BY revenue DESC, c.country;
