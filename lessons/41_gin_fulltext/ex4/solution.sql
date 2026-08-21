SELECT id
FROM reviews
WHERE to_tsvector('english', body)
      @@ websearch_to_tsquery('english', 'excellent OR durable');
