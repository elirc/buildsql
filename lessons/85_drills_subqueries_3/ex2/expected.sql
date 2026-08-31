SELECT category,
       count(*) AS products,
       round(100.0 * count(*) / (SELECT count(*) FROM products), 2) AS pct_of_catalog
FROM products
GROUP BY category
ORDER BY category;
