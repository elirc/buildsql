SELECT category, revenue,
       round(100 * revenue / sum(revenue) OVER (), 2) AS pct
FROM (SELECT p.category, sum(oi.quantity * oi.price) AS revenue
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      WHERE o.created_at >= DATE '2023-11-01'
      GROUP BY p.category) t
ORDER BY revenue DESC, category;
