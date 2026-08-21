SELECT e.name AS employee, m.name AS manager, g.name AS grandmanager
FROM staff e
JOIN staff m ON m.id = e.manager_id
JOIN staff g ON g.id = m.manager_id;
