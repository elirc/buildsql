SELECT category, id, name, reviews
FROM (
  SELECT p.category, p.id, p.name, count(*) AS reviews,
         row_number() OVER (PARTITION BY p.category
                            ORDER BY count(*) DESC, p.id) AS rn
  FROM products p
  JOIN reviews r ON r.product_id = p.id
  GROUP BY p.id
) ranked
WHERE rn <= 2
ORDER BY category, reviews DESC, id;
