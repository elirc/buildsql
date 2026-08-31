SELECT id, email
FROM customers
WHERE email ~ '^user[0-9]{2}@example\.com$'
ORDER BY id;
