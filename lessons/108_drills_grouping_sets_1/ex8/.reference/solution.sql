SELECT COALESCE(manager_id::text, 'NOBODY') AS manager_label,
       count(*) AS headcount
FROM staff
GROUP BY manager_id
UNION ALL
SELECT 'ALL', count(*)
FROM staff
ORDER BY 2 DESC, 1;
