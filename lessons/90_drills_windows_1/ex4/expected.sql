SELECT id, name,
       extract(year FROM hired_on)::int AS hire_year,
       hired_on, salary,
       rank() OVER (PARTITION BY extract(year FROM hired_on)
                    ORDER BY salary DESC) AS year_rank
FROM staff
ORDER BY hire_year, year_rank, id;
