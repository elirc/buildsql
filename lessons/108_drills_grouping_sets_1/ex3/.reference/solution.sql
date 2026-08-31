SELECT status AS status_label, count(*) AS orders
FROM orders
GROUP BY status
UNION ALL
SELECT 'all statuses', count(*)
FROM orders
ORDER BY 1;
