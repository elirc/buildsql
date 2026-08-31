SELECT category, count(*) AS products
FROM products
GROUP BY category
HAVING max(price) > 499.5
ORDER BY category;
