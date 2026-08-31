SELECT o.id, o.status, o.total
FROM orders AS o
WHERE o.status IN ('shipped', 'cancelled')
  AND o.total < 15;
