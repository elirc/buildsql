SELECT country,
  count(*) FILTER (WHERE extract(year FROM created_at) = 2022),
  count(*) FILTER (WHERE extract(year FROM created_at) = 2023)
FROM customers GROUP BY country;
