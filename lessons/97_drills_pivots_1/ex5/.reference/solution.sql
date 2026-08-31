SELECT category,
       count(*) AS products,
       sum(CASE WHEN price >= 250 THEN 1 ELSE 0 END) AS dear,
       round(100.0 * sum(CASE WHEN price >= 250 THEN 1 ELSE 0 END) / count(*), 1) AS pct_dear
FROM products
GROUP BY 1
ORDER BY 1;
