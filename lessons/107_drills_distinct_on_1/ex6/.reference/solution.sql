WITH ranked AS (
  SELECT manager_id, name, hired_on,
         row_number() OVER (PARTITION BY manager_id
                            ORDER BY hired_on DESC, id DESC) AS rn
  FROM staff
  WHERE manager_id IS NOT NULL)
SELECT r.manager_id, m.name AS manager, r.name AS newest_report, r.hired_on
FROM ranked r
JOIN staff m ON m.id = r.manager_id
WHERE r.rn = 1
ORDER BY r.manager_id;
