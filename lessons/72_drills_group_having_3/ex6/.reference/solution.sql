SELECT category, count(*) AS products
FROM products
GROUP BY category
HAVING count(*) FILTER (WHERE price > 499.5) > 0
ORDER BY category;
