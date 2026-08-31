SELECT category, product_id, reviews
FROM (SELECT p.category, r.product_id, count(r.id) AS reviews,
             row_number() OVER (PARTITION BY p.category
                                ORDER BY count(r.id) DESC, r.product_id) AS rn
      FROM reviews r
      JOIN products p ON p.id = r.product_id
      GROUP BY p.category, r.product_id) t
WHERE rn <= 2
ORDER BY category, reviews DESC, product_id;
