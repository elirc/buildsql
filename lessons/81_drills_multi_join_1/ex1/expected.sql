SELECT o.status, count(*) AS orders, sum(o.total) AS revenue
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE c.country = 'GB'
  AND o.created_at >= '2023-09-01'
  AND o.created_at <  '2023-10-01'
GROUP BY o.status
ORDER BY o.status;
