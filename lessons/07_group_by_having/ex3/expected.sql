SELECT category, count(*), round(avg(price), 2)
FROM products
WHERE price > 100
GROUP BY category;
