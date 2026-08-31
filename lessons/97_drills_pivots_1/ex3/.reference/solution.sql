SELECT date_trunc('month', created_at) AS month,
       count(CASE WHEN status = 'pending' THEN 1 END) AS pending,
       count(CASE WHEN status = 'paid' THEN 1 END) AS paid,
       count(CASE WHEN status = 'shipped' THEN 1 END) AS shipped,
       count(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled
FROM orders
GROUP BY 1
ORDER BY 1;
