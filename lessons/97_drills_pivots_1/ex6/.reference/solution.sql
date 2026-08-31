SELECT customer_id,
       count(CASE WHEN event_type = 'view' THEN 1 END) AS views,
       count(CASE WHEN event_type = 'click' THEN 1 END) AS clicks,
       count(CASE WHEN event_type = 'add_to_cart' THEN 1 END) AS carts,
       count(CASE WHEN event_type = 'purchase' THEN 1 END) AS purchases,
       count(CASE WHEN event_type = 'logout' THEN 1 END) AS logouts
FROM events
WHERE customer_id <= 10
GROUP BY 1
ORDER BY 1;
