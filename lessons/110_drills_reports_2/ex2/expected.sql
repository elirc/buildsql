SELECT date_trunc('quarter', created_at) AS quarter,
       count(*) AS signups
FROM customers
GROUP BY date_trunc('quarter', created_at)
ORDER BY quarter;
