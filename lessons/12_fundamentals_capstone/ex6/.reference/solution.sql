SELECT p.id, p.name, p.category, sum(oi.quantity) AS units
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.status IN ('paid', 'shipped')
  AND o.created_at >= '2023-07-01'
  AND o.created_at <  '2023-10-01'
GROUP BY p.id
ORDER BY units DESC, p.id
LIMIT 5;
