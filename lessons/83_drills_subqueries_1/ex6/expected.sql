SELECT t.customer_id, t.orders, t.revenue
FROM (SELECT customer_id, count(*) AS orders, sum(total) AS revenue
      FROM orders
      WHERE status <> 'cancelled'
      GROUP BY customer_id) t
WHERE t.orders >= 15
ORDER BY t.revenue DESC, t.customer_id;
