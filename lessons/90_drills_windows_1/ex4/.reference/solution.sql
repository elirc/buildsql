WITH hires AS (
    SELECT id, name, extract(year FROM hired_on)::int AS hire_year,
           hired_on, salary
    FROM staff
)
SELECT id, name, hire_year, hired_on, salary,
       rank() OVER (PARTITION BY hire_year ORDER BY salary DESC) AS year_rank
FROM hires
ORDER BY hire_year, year_rank, id;
