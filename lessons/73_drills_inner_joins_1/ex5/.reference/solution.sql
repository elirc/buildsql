SELECT c.country,
       count(e.id) AS events,
       count(DISTINCT c.id) AS actives
FROM customers c
JOIN events e ON e.customer_id = c.id
WHERE e.id <= 200000
  AND e.event_type = 'purchase'
GROUP BY c.country
ORDER BY c.country;
