SELECT id, email,
       left(email, 1)
         || repeat('*', position('@' IN email) - 2)
         || substring(email FROM position('@' IN email)) AS masked
FROM customers
WHERE id <= 30
ORDER BY id;
