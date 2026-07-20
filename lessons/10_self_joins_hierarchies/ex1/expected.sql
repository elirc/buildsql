SELECT e.name, m.name FROM staff e
JOIN staff m ON m.id = e.manager_id;
