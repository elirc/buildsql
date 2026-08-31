SELECT c.id, c.email, c.country
FROM customers AS c
WHERE c.email ~ '^user..@example[.]com$'
  AND NOT (c.country = 'US' OR c.country = 'GB');
