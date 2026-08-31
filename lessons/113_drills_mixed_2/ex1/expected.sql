SELECT left(name, 1) AS initial, count(*) AS customers
FROM customers
GROUP BY left(name, 1)
ORDER BY customers DESC, initial ASC
LIMIT 5;
