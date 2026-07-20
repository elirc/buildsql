SELECT e.id, e.name, e.salary, m.salary AS manager_salary
FROM staff e
JOIN staff m ON m.id = e.manager_id
WHERE e.salary > m.salary;
