WITH ranked AS (
  SELECT p.category, r.id, r.rating, r.created_at,
         row_number() OVER (PARTITION BY p.category
                            ORDER BY r.created_at DESC, r.id DESC) AS rn
  FROM reviews r
  JOIN products p ON p.id = r.product_id)
SELECT category, id AS review_id, rating, created_at
FROM ranked
WHERE rn = 1
ORDER BY category;
