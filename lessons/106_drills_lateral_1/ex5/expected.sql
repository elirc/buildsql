SELECT r.rating, t.review_id, t.created_at
FROM (SELECT DISTINCT rating FROM reviews) r
CROSS JOIN LATERAL (
  SELECT rv.id AS review_id, rv.created_at
  FROM reviews rv
  WHERE rv.rating = r.rating
  ORDER BY rv.created_at DESC, rv.id DESC
  LIMIT 3) t
ORDER BY r.rating, t.created_at DESC, t.review_id DESC;
