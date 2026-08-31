SELECT id, name, hired_on,
       (DATE '2023-11-14' - hired_on) AS tenure_days,
       round((DATE '2023-11-14' - hired_on)::numeric / 365, 1) AS tenure_years
FROM staff
WHERE department = 'engineering'
ORDER BY 3, 1;
