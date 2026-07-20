WITH RECURSIVE org AS (
  SELECT id, name, 1 AS depth FROM staff WHERE manager_id IS NULL
  UNION ALL
  SELECT s.id, s.name, org.depth + 1 FROM staff s
  JOIN org ON s.manager_id = org.id
)
SELECT id, name, depth FROM org;
