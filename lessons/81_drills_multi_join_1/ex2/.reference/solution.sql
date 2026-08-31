SELECT p.id, p.name, t.units
FROM (SELECT oi.product_id, sum(oi.quantity) AS units
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.created_at >= DATE '2023-10-01'
        AND o.created_at <  DATE '2023-11-01'
      GROUP BY oi.product_id) t
JOIN products p ON p.id = t.product_id
ORDER BY t.units DESC, p.id
LIMIT 10;
