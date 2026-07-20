SELECT id, split_part(email, '@', 1) AS username
FROM customers
WHERE id <= 100;
