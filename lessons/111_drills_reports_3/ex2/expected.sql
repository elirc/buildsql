SELECT sum(oi.quantity * oi.price) FILTER (WHERE p.category = 'books')       AS books_rev,
       sum(oi.quantity * oi.price) FILTER (WHERE p.category = 'electronics') AS electronics_rev
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
WHERE o.status <> 'cancelled'
  AND o.created_at >= '2023-10-01' AND o.created_at < '2023-11-01'
  AND p.category IN ('books', 'electronics');
