SELECT p.id, p.name
FROM products p
JOIN (SELECT DISTINCT product_id FROM reviews
      WHERE rating = 5 AND created_at >= DATE '2023-11-01') good
  ON good.product_id = p.id
LEFT JOIN (SELECT DISTINCT product_id FROM reviews
           WHERE rating = 1 AND created_at >= DATE '2023-11-01') bad
  ON bad.product_id = p.id
WHERE p.category = 'books' AND bad.product_id IS NULL
ORDER BY p.id;
