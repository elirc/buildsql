SELECT id, email,
       overlay(email PLACING repeat('*', position('@' IN email) - 2)
                     FROM 2 FOR position('@' IN email) - 2) AS masked
FROM customers
WHERE id <= 30
ORDER BY 1;
