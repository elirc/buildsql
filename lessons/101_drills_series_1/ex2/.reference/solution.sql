SELECT (DATE '2023-01-01' + make_interval(months => n))::date AS month_start,
       to_char(DATE '2023-01-01' + make_interval(months => n), 'Mon') AS month_name
FROM generate_series(0, 11) AS n
ORDER BY 1;
