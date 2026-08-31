SELECT id, customer_id, created_at, total,
       round(sum(total) OVER (PARTITION BY customer_id,
                                           date_trunc('month', created_at)), 2)
         AS month_total
FROM orders
WHERE customer_id <= 10
ORDER BY customer_id, created_at, id;
