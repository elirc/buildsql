SELECT country, category, revenue
FROM (SELECT c.country, p.category,
             sum(oi.quantity * oi.price) AS revenue,
             row_number() OVER (PARTITION BY c.country
                                ORDER BY sum(oi.quantity * oi.price) DESC,
                                         p.category) AS rn
      FROM customers c
      JOIN orders o ON o.customer_id = c.id
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      WHERE o.created_at >= DATE '2023-11-01'
      GROUP BY c.country, p.category) x
WHERE rn = 1
ORDER BY country;
