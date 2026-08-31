WITH ranked AS (
  SELECT rating, id, created_at,
         row_number() OVER (PARTITION BY rating
                            ORDER BY created_at DESC, id DESC) AS rn
  FROM reviews)
SELECT rating, id AS review_id, created_at
FROM ranked
WHERE rn <= 3
ORDER BY rating, created_at DESC, review_id DESC;
