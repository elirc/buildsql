SELECT product_id FROM reviews
EXCEPT
SELECT product_id FROM order_items
ORDER BY 1;
