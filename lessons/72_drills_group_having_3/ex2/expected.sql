SELECT category, count(*) AS products, min(price) AS cheapest
FROM products
GROUP BY category
HAVING min(price) > 1.25
ORDER BY category;
