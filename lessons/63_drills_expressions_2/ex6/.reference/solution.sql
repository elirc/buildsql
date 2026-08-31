SELECT q.id, q.email, replace(q.local_part, 'user', '') AS id_text
FROM (
  SELECT c.id, c.email, split_part(c.email, '@', 1) AS local_part
  FROM customers AS c
) AS q;
