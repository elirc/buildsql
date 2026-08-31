SELECT id, rating,
       sum(rating) OVER (ORDER BY rating, id
                         ROWS BETWEEN UNBOUNDED PRECEDING
                                  AND CURRENT ROW) AS sum_rows,
       sum(rating) OVER (ORDER BY rating
                         RANGE BETWEEN UNBOUNDED PRECEDING
                                   AND CURRENT ROW) AS sum_range
FROM reviews
WHERE product_id = 77
ORDER BY rating, id;
