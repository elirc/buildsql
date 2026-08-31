SELECT p.id, p.name, s.buyers, s.units, count(r.id) AS reviews
FROM products p
JOIN (SELECT oi.product_id,
             count(DISTINCT o.customer_id) AS buyers,
             sum(oi.quantity) AS units
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      JOIN order_items oi ON oi.order_id = o.id
      WHERE c.country = 'JP'
        AND o.created_at >= '2023-10-01'
        AND o.created_at <  '2023-11-01'
      GROUP BY oi.product_id
      HAVING count(DISTINCT o.customer_id) >= 2) s ON s.product_id = p.id
JOIN reviews r ON r.product_id = p.id
WHERE p.category = 'electronics'
GROUP BY p.id, p.name, s.buyers, s.units
ORDER BY s.units DESC, p.id;
