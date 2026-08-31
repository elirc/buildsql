WITH october AS (
  SELECT DISTINCT customer_id
  FROM orders
  WHERE created_at >= '2023-10-01' AND created_at < '2023-11-01')
SELECT count(*) AS lapsed
FROM october o
WHERE NOT EXISTS (
  SELECT 1
  FROM orders n
  WHERE n.customer_id = o.customer_id
    AND n.created_at >= '2023-11-01' AND n.created_at < '2023-12-01');
