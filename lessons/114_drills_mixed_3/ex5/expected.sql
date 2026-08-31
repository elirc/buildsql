WITH RECURSIVE directs AS (
  SELECT id, name
  FROM staff
  WHERE manager_id = (SELECT id FROM staff WHERE manager_id IS NULL)),
tree AS (
  SELECT d.id AS root_id, d.name AS root_name, d.id AS member_id
  FROM directs d
  UNION ALL
  SELECT t.root_id, t.root_name, s.id
  FROM tree t
  JOIN staff s ON s.manager_id = t.member_id)
SELECT root_name AS name, count(*) AS subtree
FROM tree
GROUP BY root_id, root_name
ORDER BY subtree DESC, name ASC;
