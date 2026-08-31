WITH RECURSIVE walk AS (
  SELECT s.id, s.name AS anchor_name, s.id AS anchor_id
  FROM staff s
  JOIN staff ceo ON ceo.id = s.manager_id
                AND ceo.manager_id IS NULL
  UNION ALL
  SELECT s.id, w.anchor_name, w.anchor_id
  FROM staff s
  JOIN walk w ON s.manager_id = w.id)
SELECT anchor_name AS name, count(*) AS subtree
FROM walk
GROUP BY anchor_id, anchor_name
ORDER BY subtree DESC, name ASC;
