SELECT id, email, country
FROM customers
WHERE email LIKE 'user__@example.com'
  AND country NOT IN ('US', 'GB');
