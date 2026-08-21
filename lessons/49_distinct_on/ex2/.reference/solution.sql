-- 49_distinct_on/ex2 reference
SELECT DISTINCT ON (department)
       department, name, hired_on
FROM staff
ORDER BY department, hired_on DESC, id;
