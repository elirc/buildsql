SELECT e.name AS employee, m.name AS manager
FROM staff e
JOIN staff m ON m.id = e.manager_id;
