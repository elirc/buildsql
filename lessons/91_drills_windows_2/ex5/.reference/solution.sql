SELECT o.id, o.customer_id, o.created_at, o.total,
       round(m.month_total, 2) AS month_total
FROM orders o
JOIN (SELECT customer_id,
             date_trunc('month', created_at) AS month,
             sum(total) AS month_total
      FROM orders
      WHERE customer_id <= 10
      GROUP BY 1, 2) m
  ON m.customer_id = o.customer_id
 AND m.month = date_trunc('month', o.created_at)
WHERE o.customer_id <= 10
ORDER BY o.customer_id, o.created_at, o.id;
