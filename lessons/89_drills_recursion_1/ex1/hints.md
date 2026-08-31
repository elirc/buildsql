## Hint 1

The anchor is the one row that has no manager. The step finds everyone whose manager is already in the result, and adds one to the depth it found there.

## Hint 2

`WITH RECURSIVE org AS (SELECT id, 1 AS depth FROM staff WHERE manager_id IS NULL UNION ALL SELECT s.id, org.depth + 1 FROM staff s JOIN org ON s.manager_id = org.id)`, then group the whole thing by `depth`.
