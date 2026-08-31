SELECT country, count(id) AS customers, min(created_at) AS first_signup
FROM customers
GROUP BY 1
ORDER BY 1;
