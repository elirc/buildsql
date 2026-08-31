SELECT count(*) AS one_star,
       count(DISTINCT product_id) AS products_hit
FROM reviews
WHERE rating = 1;
