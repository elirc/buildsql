SELECT id, name, country
FROM customers
WHERE country NOT IN ('US', 'GB', 'DE', 'FR', 'CA');
