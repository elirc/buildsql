WITH units AS (
  SELECT p.category, p.id, p.name, sum(oi.quantity) AS units
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  GROUP BY p.category, p.id, p.name),
ranked AS (
  SELECT category, id, name, units,
         row_number() OVER (PARTITION BY category
                            ORDER BY units DESC, id) AS rn
  FROM units)
SELECT category, id, name, units
FROM ranked
WHERE rn = 1
ORDER BY category;
