SELECT c.category, t.product_id, t.name, t.units
FROM (SELECT DISTINCT category FROM products) c
CROSS JOIN LATERAL (
  SELECT p.id AS product_id, p.name, sum(oi.quantity) AS units
  FROM products p
  JOIN order_items oi ON oi.product_id = p.id
  JOIN orders o ON o.id = oi.order_id
  WHERE p.category = c.category
    AND o.created_at >= '2023-10-01'
  GROUP BY p.id, p.name
  ORDER BY units DESC, p.id ASC
  LIMIT 3) t
ORDER BY c.category, t.units DESC, t.product_id;
