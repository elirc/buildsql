SELECT category,
       round(avg(price), 2) AS avg_price,
       round(avg(CASE WHEN price < 100 THEN price END), 2) AS avg_cheap,
       round(avg(CASE WHEN price >= 400 THEN price END), 2) AS avg_dear
FROM products
GROUP BY 1
ORDER BY 1;
