SELECT upper(left(name, 1)) AS initial, count(*) AS customers
FROM customers
GROUP BY 1
ORDER BY 1;
