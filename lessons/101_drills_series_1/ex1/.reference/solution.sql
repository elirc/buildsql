SELECT generate_series(DATE '2023-01-01', DATE '2023-01-31', interval '1 day')::date AS day
ORDER BY day;
