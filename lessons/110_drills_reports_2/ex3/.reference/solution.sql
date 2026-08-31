WITH scored AS (
  SELECT product_id,
         count(*) AS reviews,
         avg(rating) AS raw_avg
  FROM reviews
  GROUP BY product_id
  HAVING count(*) >= 100)
SELECT p.id, p.name, s.reviews, round(s.raw_avg, 2) AS avg_rating
FROM scored s
JOIN products p ON p.id = s.product_id
ORDER BY s.raw_avg ASC, p.id ASC
LIMIT 10;
