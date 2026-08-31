WITH seq AS (
  SELECT customer_id, total,
         row_number() OVER (PARTITION BY customer_id
                            ORDER BY created_at ASC, id ASC) AS rn_first,
         row_number() OVER (PARTITION BY customer_id
                            ORDER BY created_at DESC, id DESC) AS rn_last,
         count(*) OVER (PARTITION BY customer_id) AS orders
  FROM orders
  WHERE customer_id <= 10)
SELECT customer_id,
       orders,
       max(total) FILTER (WHERE rn_first = 1) AS first_total,
       max(total) FILTER (WHERE rn_last = 1) AS last_total,
       CASE WHEN max(total) FILTER (WHERE rn_last = 1)
               > max(total) FILTER (WHERE rn_first = 1) THEN 'up'
            WHEN max(total) FILTER (WHERE rn_last = 1)
               < max(total) FILTER (WHERE rn_first = 1) THEN 'down'
            ELSE 'flat' END AS direction
FROM seq
WHERE orders >= 2
GROUP BY customer_id, orders
ORDER BY customer_id;
