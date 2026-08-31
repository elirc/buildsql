SELECT id FROM customers WHERE country = 'MX'
UNION ALL
SELECT id FROM customers WHERE created_at < '2022-01-01'
ORDER BY id;
