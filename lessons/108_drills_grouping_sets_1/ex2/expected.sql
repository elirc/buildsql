SELECT country,
       extract(year FROM created_at)::int AS yr,
       count(*) AS signups
FROM customers
WHERE country IN ('US', 'GB', 'DE')
GROUP BY ROLLUP (country, extract(year FROM created_at)::int)
ORDER BY country, yr;
