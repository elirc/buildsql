SELECT id
FROM reviews
WHERE to_tsvector('english', body) @@ to_tsquery('english', 'excellent & battery');
