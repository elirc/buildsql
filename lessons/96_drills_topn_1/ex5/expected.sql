WITH counts AS (
  SELECT p.category, p.id AS product_id, count(*) AS reviews
  FROM reviews r
  JOIN products p ON p.id = r.product_id
  GROUP BY p.category, p.id),
ranked AS (
  SELECT category, product_id, reviews,
         row_number() OVER (PARTITION BY category
                            ORDER BY reviews DESC, product_id ASC) AS rn
  FROM counts)
SELECT category, product_id, reviews
FROM ranked
WHERE rn <= 2
ORDER BY category ASC, reviews DESC, product_id ASC;
