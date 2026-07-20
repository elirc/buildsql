SELECT DISTINCT category, attributes ->> 'color' AS color
FROM products;
