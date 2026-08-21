SELECT e.name AS employee,
       m.name AS manager
FROM staff e
LEFT JOIN staff m ON m.id = e.manager_id;
