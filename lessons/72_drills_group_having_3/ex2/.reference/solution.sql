SELECT category, count(*) AS products, min(price) AS cheapest
FROM products
GROUP BY category
HAVING 1.25 < min(price)
ORDER BY category;
