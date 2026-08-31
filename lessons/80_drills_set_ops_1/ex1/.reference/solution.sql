SELECT DISTINCT id
FROM customers
WHERE country = 'MX' OR created_at < DATE '2022-01-01'
ORDER BY id;
