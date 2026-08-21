SELECT g.month::date AS month, count(s.id) AS hires
FROM generate_series(DATE '2019-01-01', DATE '2019-12-01',
                     INTERVAL '1 month') AS g(month)
LEFT JOIN staff s ON s.department = 'sales'
                 AND date_trunc('month', s.hired_on)::date = g.month::date
GROUP BY 1
ORDER BY 1;
