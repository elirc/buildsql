SELECT o.id, o.customer_id, o.total,
       t.customer_orders,
       round(t.customer_total, 2) AS customer_total
FROM orders o
JOIN (SELECT customer_id,
             count(*) AS customer_orders,
             sum(total) AS customer_total
      FROM orders
      WHERE customer_id <= 15
      GROUP BY customer_id) t ON t.customer_id = o.customer_id
WHERE o.customer_id <= 15
ORDER BY o.customer_id, o.id;
