SELECT customer_id, id, created_at, total,
       round(sum(total) OVER (PARTITION BY customer_id
                              ORDER BY created_at, id), 2) AS running_spend
FROM orders
WHERE customer_id <= 8
ORDER BY customer_id, created_at, id;
