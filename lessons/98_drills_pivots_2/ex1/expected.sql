SELECT category,
       round(avg(price), 2) AS avg_price,
       round(avg(price) FILTER (WHERE price < 100), 2) AS avg_cheap,
       round(avg(price) FILTER (WHERE price >= 400), 2) AS avg_dear
FROM products
GROUP BY category
ORDER BY category;
