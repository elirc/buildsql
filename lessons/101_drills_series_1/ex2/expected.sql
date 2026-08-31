SELECT g::date AS month_start,
       to_char(g, 'Mon') AS month_name
FROM generate_series(DATE '2023-01-01', DATE '2023-12-01', interval '1 month') AS g
ORDER BY month_start;
