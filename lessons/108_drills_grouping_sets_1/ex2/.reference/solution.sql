SELECT country, extract(year FROM created_at)::int AS yr, count(*) AS signups
FROM customers
WHERE country IN ('US', 'GB', 'DE')
GROUP BY country, extract(year FROM created_at)::int
UNION ALL
SELECT country, NULL::int, count(*)
FROM customers
WHERE country IN ('US', 'GB', 'DE')
GROUP BY country
UNION ALL
SELECT NULL::text, NULL::int, count(*)
FROM customers
WHERE country IN ('US', 'GB', 'DE')
ORDER BY 1, 2;
