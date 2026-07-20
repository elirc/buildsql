WITH cohorts AS (
    SELECT id, date_trunc('month', created_at) AS cohort
    FROM customers
    WHERE created_at >= '2023-01-01'
)
SELECT cohort,
       count(*) AS signups,
       count(*) FILTER (WHERE EXISTS (
           SELECT 1 FROM orders o WHERE o.customer_id = cohorts.id
       )) AS buyers
FROM cohorts
GROUP BY cohort
ORDER BY cohort;
