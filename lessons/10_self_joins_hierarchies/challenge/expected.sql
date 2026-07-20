SELECT e.id, e.name, e.salary, m.salary FROM staff e
JOIN staff m ON m.id = e.manager_id
WHERE e.salary > m.salary;
