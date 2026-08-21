## Hint 1
One `GROUP BY event_type` with two counts - one of rows, one of
distinct customers.

## Hint 2
`SELECT event_type, count(*) AS events, count(DISTINCT customer_id) AS customers FROM events WHERE ts >= '2023-11-08' AND ts < '2023-11-15' GROUP BY event_type ORDER BY events DESC, event_type;`
