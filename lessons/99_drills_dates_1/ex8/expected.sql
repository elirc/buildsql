SELECT o.id, o.created_at, count(o2.id) AS within_30d
FROM orders o
LEFT JOIN orders o2
       ON o2.customer_id = o.customer_id
      AND o2.created_at > o.created_at
      AND o2.created_at < o.created_at + interval '30 days'
WHERE o.customer_id = 42
GROUP BY o.id, o.created_at
ORDER BY o.created_at, o.id;
