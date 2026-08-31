SELECT c.country,
       count(*) FILTER (WHERE o.status = 'paid')      AS paid,
       count(*) FILTER (WHERE o.status = 'shipped')   AS shipped,
       count(*) FILTER (WHERE o.status = 'cancelled') AS cancelled
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.country
HAVING count(*) FILTER (WHERE o.status = 'cancelled')
     > count(*) FILTER (WHERE o.status = 'shipped')
ORDER BY c.country;
