SELECT id, name, hired_on,
       DATE '2023-11-14' - hired_on AS tenure_days,
       round((DATE '2023-11-14' - hired_on) / 365.0, 1) AS tenure_years
FROM staff
WHERE department = 'engineering'
ORDER BY hired_on, id;
