SELECT country,
       count(CASE WHEN extract(year FROM created_at) = 2022 THEN 1 END) AS y2022,
       count(CASE WHEN extract(year FROM created_at) = 2023 THEN 1 END) AS y2023
FROM customers
GROUP BY country;
