SELECT id, name, country
FROM customers
WHERE country IN ('US', 'GB', 'DE')
  AND name LIKE 'A%';
