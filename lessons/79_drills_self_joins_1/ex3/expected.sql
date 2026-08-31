SELECT e.id, e.name, m.name AS manager, e.salary - m.salary AS gap
FROM staff e
LEFT JOIN staff m ON m.id = e.manager_id
ORDER BY e.id;
