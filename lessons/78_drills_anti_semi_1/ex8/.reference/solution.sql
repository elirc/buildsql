SELECT o.id, o.status, o.total
FROM orders o
JOIN (SELECT oi.order_id
      FROM order_items oi
      JOIN orders o2 ON o2.id = oi.order_id
           AND o2.created_at >= DATE '2023-11-01'
      GROUP BY oi.order_id
      HAVING count(*) FILTER (WHERE oi.quantity <> 5) = 0) x ON x.order_id = o.id
WHERE o.created_at >= DATE '2023-11-01'
ORDER BY o.id;
