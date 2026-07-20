SELECT date_trunc('month', c.created_at), count(*),
       count(*) FILTER (WHERE EXISTS
         (SELECT 1 FROM orders o WHERE o.customer_id = c.id))
FROM customers c
WHERE c.created_at >= '2023-01-01'
GROUP BY 1 ORDER BY 1;
