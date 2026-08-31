SELECT DISTINCT ON (s.manager_id)
       s.manager_id, m.name AS manager, s.name AS newest_report, s.hired_on
FROM staff s
JOIN staff m ON m.id = s.manager_id
ORDER BY s.manager_id, s.hired_on DESC, s.id DESC;
