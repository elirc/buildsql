SELECT date_trunc('month', created_at), sum(total)
FROM orders GROUP BY 1 ORDER BY 1;
