SELECT floor(price / 100) * 100 AS band,
       category,
       count(*) AS products,
       round(100.0 * count(*)
             / sum(count(*)) OVER (PARTITION BY floor(price / 100) * 100), 2)
         AS pct_of_band
FROM products
GROUP BY 1, 2
ORDER BY band, category;
