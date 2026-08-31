SELECT country, count(*) AS customers, min(created_at) AS first_signup
FROM customers
GROUP BY country
ORDER BY country;
