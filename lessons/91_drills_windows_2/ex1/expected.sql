SELECT id, name, category, price,
       count(*) OVER (PARTITION BY category) AS in_category,
       round(price - avg(price) OVER (PARTITION BY category), 2) AS vs_avg
FROM products
WHERE price > 480
ORDER BY category, id;
