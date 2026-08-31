SELECT count(*) AS one_star,
       (SELECT count(*) FROM (SELECT DISTINCT product_id
                              FROM reviews WHERE rating = 1) d) AS products_hit
FROM reviews
WHERE rating = 1;
