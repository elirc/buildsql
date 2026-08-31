SELECT country, count(*) AS customers
FROM customers
GROUP BY country
ORDER BY count(*) DESC, country ASC
LIMIT 5;
