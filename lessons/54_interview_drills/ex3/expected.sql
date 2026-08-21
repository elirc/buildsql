WITH ranked AS (
  SELECT o.customer_id, o.id, o.created_at, o.total,
         row_number() OVER (PARTITION BY o.customer_id
                            ORDER BY o.created_at DESC, o.id DESC) AS rn
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  WHERE c.country = 'JP')
SELECT customer_id, id, created_at, total
FROM ranked
WHERE rn = 1
ORDER BY customer_id;
