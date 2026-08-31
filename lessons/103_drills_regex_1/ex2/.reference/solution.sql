SELECT id, email
FROM customers
WHERE email ~ '^user[0-9][0-9]@example[.]com$'
ORDER BY 1;
