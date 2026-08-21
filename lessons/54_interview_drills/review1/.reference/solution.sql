SELECT DISTINCT ON (category) category, id, name, units
FROM (
  SELECT p.category, p.id, p.name, sum(oi.quantity) AS units
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  GROUP BY p.category, p.id, p.name
) totals
ORDER BY category, units DESC, id;
