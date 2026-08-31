SELECT customer_id,
       count(*) FILTER (WHERE event_type = 'view') AS views,
       count(*) FILTER (WHERE event_type = 'click') AS clicks,
       count(*) FILTER (WHERE event_type = 'add_to_cart') AS carts,
       count(*) FILTER (WHERE event_type = 'purchase') AS purchases,
       count(*) FILTER (WHERE event_type = 'logout') AS logouts
FROM events
WHERE customer_id <= 10
GROUP BY customer_id
ORDER BY customer_id;
