SELECT o.status, count(o.id), sum(o.total)
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'GB'
  AND o.created_at >= DATE '2023-09-01'
  AND o.created_at <  DATE '2023-10-01'
GROUP BY o.status
ORDER BY 1;
