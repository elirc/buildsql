SELECT date_trunc('month', created_at) AS month,
       count(*) FILTER (WHERE status = 'pending') AS pending,
       count(*) FILTER (WHERE status = 'paid') AS paid,
       count(*) FILTER (WHERE status = 'shipped') AS shipped,
       count(*) FILTER (WHERE status = 'cancelled') AS cancelled
FROM orders
GROUP BY date_trunc('month', created_at)
ORDER BY month;
