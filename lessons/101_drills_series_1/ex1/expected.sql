SELECT g::date AS day
FROM generate_series(DATE '2023-01-01', DATE '2023-01-31', interval '1 day') AS g
ORDER BY day;
