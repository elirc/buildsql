SELECT o.id, p.name, round(avg(oi.quantity))::int,
       round(avg(r.rating), 1)
FROM customers c
JOIN orders o       ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
JOIN reviews r      ON r.product_id = p.id
WHERE c.id = 4242
GROUP BY o.id, p.name;
