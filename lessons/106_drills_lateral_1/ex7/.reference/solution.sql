WITH sold AS (
  SELECT p.category, p.id, p.name, sum(oi.quantity) AS units
  FROM products p
  JOIN order_items oi ON oi.product_id = p.id
  JOIN orders o ON o.id = oi.order_id
  WHERE o.created_at >= '2023-10-01'
  GROUP BY p.category, p.id, p.name),
ranked AS (
  SELECT category, id, name, units,
         row_number() OVER (PARTITION BY category
                            ORDER BY units DESC, id) AS rn
  FROM sold)
SELECT category, id AS product_id, name, units
FROM ranked
WHERE rn <= 3
ORDER BY category, units DESC, product_id;
