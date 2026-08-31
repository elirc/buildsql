SELECT category, units, revenue, orders, buyers, avg_line_revenue
FROM (SELECT p.category,
             sum(oi.quantity) AS units,
             sum(oi.quantity * oi.price) AS revenue,
             count(DISTINCT o.id) AS orders,
             count(DISTINCT o.customer_id) AS buyers,
             round(avg(oi.quantity * oi.price), 2) AS avg_line_revenue,
             avg(oi.quantity * oi.price) AS raw_avg
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      WHERE o.created_at >= DATE '2023-10-01'
      GROUP BY p.category) t
WHERE raw_avg > 750
ORDER BY revenue DESC, category;
