SELECT m.id, m.name, count(e.id) AS reports,
       (SELECT e2.name FROM staff e2
        WHERE e2.manager_id = m.id
        ORDER BY e2.salary DESC, e2.id
        LIMIT 1) AS top_report
FROM staff m
JOIN staff e ON e.manager_id = m.id
GROUP BY m.id, m.name
ORDER BY m.id;
