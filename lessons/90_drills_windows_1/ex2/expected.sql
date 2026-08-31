SELECT id, rating,
       rank() OVER (ORDER BY rating DESC) AS rnk,
       dense_rank() OVER (ORDER BY rating DESC) AS drnk,
       row_number() OVER (ORDER BY rating DESC, id) AS rn
FROM reviews
WHERE product_id = 42
ORDER BY rating DESC, id;
