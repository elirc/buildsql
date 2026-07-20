SELECT id, email
FROM customers
WHERE split_part(email, '@', 1) = 'user777';
