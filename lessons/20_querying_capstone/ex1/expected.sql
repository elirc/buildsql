SELECT ts::date, count(DISTINCT customer_id) FROM events
WHERE ts >= '2023-11-08' AND ts < '2023-11-15'
GROUP BY 1 ORDER BY 1;
