SELECT c.country,
       count(*) AS events,
       count(DISTINCT e.customer_id) AS actives
FROM events e
JOIN customers c ON c.id = e.customer_id
WHERE e.id <= 200000
  AND e.event_type = 'purchase'
GROUP BY c.country
ORDER BY c.country;
