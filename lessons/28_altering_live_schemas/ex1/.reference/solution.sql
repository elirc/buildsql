ALTER TABLE customers ADD COLUMN loyalty_tier text;

UPDATE customers SET loyalty_tier = 'member';

UPDATE customers SET loyalty_tier = 'vip'
WHERE id IN (SELECT customer_id FROM orders
             GROUP BY customer_id HAVING count(*) > 20);

ALTER TABLE customers ALTER COLUMN loyalty_tier SET NOT NULL;
