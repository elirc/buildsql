CREATE VIEW active_customers AS
SELECT c.id, c.name, c.country
FROM customers c
WHERE EXISTS (SELECT 1
              FROM orders o
              WHERE o.customer_id = c.id
                AND o.status IN ('paid', 'shipped'));
