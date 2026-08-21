SELECT date_trunc('month', created_at) AS month,
       status,
       sum(total) AS revenue
FROM orders
GROUP BY GROUPING SETS (
    (date_trunc('month', created_at)),
    (status),
    ()
);
