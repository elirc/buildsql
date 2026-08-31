SELECT e.id, e.name,
       (SELECT m.name FROM staff m WHERE m.id = e.manager_id) AS manager,
       e.salary - (SELECT m.salary FROM staff m WHERE m.id = e.manager_id) AS gap
FROM staff e
ORDER BY e.id;
