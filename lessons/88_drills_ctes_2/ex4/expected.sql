WITH reviewed AS (
    SELECT DISTINCT product_id FROM reviews
), sold AS (
    SELECT DISTINCT product_id FROM order_items
)
SELECT product_id FROM reviewed
EXCEPT
SELECT product_id FROM sold
ORDER BY product_id;
