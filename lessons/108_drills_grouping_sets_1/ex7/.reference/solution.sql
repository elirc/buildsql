SELECT p.category,
       p.attributes ->> 'size' AS size,
       sum(oi.quantity) AS units,
       sum(oi.quantity * oi.price) AS revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE p.category IN ('toys', 'food')
GROUP BY GROUPING SETS
  ((p.category, p.attributes ->> 'size'),
   (p.category),
   ())
ORDER BY 1, 2;
