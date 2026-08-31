SELECT count(*) AS lapsed
FROM (
  SELECT customer_id
  FROM orders
  WHERE created_at >= '2023-10-01' AND created_at < '2023-11-01'
  EXCEPT
  SELECT customer_id
  FROM orders
  WHERE created_at >= '2023-11-01' AND created_at < '2023-12-01') x;
