WITH counted AS (
  SELECT p.category, p.id, p.name, count(r.id) AS reviews
  FROM products p
  JOIN reviews r ON r.product_id = p.id
  GROUP BY p.category, p.id, p.name),
ranked AS (
  SELECT category, id, name, reviews,
         row_number() OVER (PARTITION BY category
                            ORDER BY reviews DESC, id) AS rn
  FROM counted)
SELECT category, id, name, reviews
FROM ranked
WHERE rn <= 2
ORDER BY category, reviews DESC, id;
