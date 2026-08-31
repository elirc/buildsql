SELECT c.id, c.email
FROM customers AS c
WHERE c.email ~ '^user2..@example[.]com$';
