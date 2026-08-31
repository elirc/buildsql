## Hint 1

DISTINCT ON composes with a join: pick one report per manager, and carry the manager's name along via a self-join (lesson 10). The CEO has no manager and simply never appears as a report.

## Hint 2

SELECT DISTINCT ON (s.manager_id) over staff s joined to staff m ON m.id = s.manager_id, ORDER BY s.manager_id, s.hired_on DESC, s.id DESC. The join happens before DISTINCT ON trims, and trimming happens before the output sort you see.
