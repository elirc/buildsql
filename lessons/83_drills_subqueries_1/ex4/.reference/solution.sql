SELECT p.id, p.name
FROM products p
WHERE p.category = 'clothing'
  AND NOT EXISTS (SELECT 1 FROM reviews r
                  WHERE r.product_id = p.id
                    AND r.rating = 1
                    AND r.created_at >= DATE '2023-11-01')
ORDER BY p.id;
