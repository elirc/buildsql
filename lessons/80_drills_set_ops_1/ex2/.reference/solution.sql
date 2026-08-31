SELECT id FROM (
    SELECT id FROM customers WHERE created_at < DATE '2022-01-01'
    UNION ALL
    SELECT id FROM customers WHERE country = 'MX'
) u
ORDER BY id;
