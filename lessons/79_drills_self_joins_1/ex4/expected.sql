SELECT e.id, e.name, e.department, m.name AS manager,
       m.department AS manager_department
FROM staff e
JOIN staff m ON m.id = e.manager_id
WHERE e.department <> m.department
ORDER BY e.id;
