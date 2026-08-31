WITH price AS (
  SELECT category, round(avg(price), 2) AS avg_price
  FROM products
  GROUP BY category),
rating AS (
  SELECT p.category, round(avg(r.rating), 2) AS avg_rating
  FROM reviews r
  JOIN products p ON p.id = r.product_id
  GROUP BY p.category)
SELECT price.category, price.avg_price, rating.avg_rating
FROM price
JOIN rating USING (category)
ORDER BY category;
