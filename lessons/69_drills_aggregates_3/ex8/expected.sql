SELECT count(DISTINCT c.id) AS customers,
       count(DISTINCT o.customer_id) AS buyers,
       count(o.id) AS orders,
       round(coalesce(sum(o.total), 0), 2) AS revenue,
       round(count(o.id)::numeric / count(DISTINCT c.id), 4) AS orders_per_customer
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'JP';
