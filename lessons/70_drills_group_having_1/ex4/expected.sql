SELECT category, count(*) AS products, round(avg(price), 2) AS avg_price
FROM products
GROUP BY category
HAVING avg(price) > 250
ORDER BY category;
