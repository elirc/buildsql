SELECT CASE WHEN GROUPING(manager_id) = 1 THEN 'ALL'
            WHEN manager_id IS NULL THEN 'NOBODY'
            ELSE manager_id::text END AS manager_label,
       count(*) AS headcount
FROM staff
GROUP BY ROLLUP (manager_id)
ORDER BY headcount DESC, manager_label;
