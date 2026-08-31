SELECT CASE WHEN GROUPING(status) = 1 THEN 'all statuses'
            ELSE status END AS status_label,
       count(*) AS orders
FROM orders
GROUP BY ROLLUP (status)
ORDER BY status_label;
