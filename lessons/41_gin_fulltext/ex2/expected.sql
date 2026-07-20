SELECT id
FROM reviews
WHERE to_tsvector('english', body) @@ to_tsquery('english', 'durable')
ORDER BY ts_rank(to_tsvector('english', body),
                 to_tsquery('english', 'durable')) DESC, id
LIMIT 5;
