SELECT id, rating,
       rank() OVER w AS rnk,
       dense_rank() OVER w AS drnk,
       row_number() OVER (ORDER BY rating DESC, id) AS rn
FROM reviews
WHERE product_id = 42
WINDOW w AS (ORDER BY rating DESC)
ORDER BY rating DESC, id;
