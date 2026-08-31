SELECT c.id, c.name, c.country
FROM customers AS c
WHERE NOT (c.country IN ('US', 'GB', 'DE', 'FR', 'CA'));
