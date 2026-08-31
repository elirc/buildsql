SELECT category,
       count(*) AS products,
       count(*) FILTER (WHERE price >= 250) AS dear,
       round(100.0 * count(*) FILTER (WHERE price >= 250) / count(*), 1) AS pct_dear
FROM products
GROUP BY category
ORDER BY category;
