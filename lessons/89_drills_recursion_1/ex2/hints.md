## Hint 1

This walk goes the other way. Ask yourself which side of the join condition changes when you climb instead of descend.

## Hint 2

Anchor on `WHERE id = (SELECT id FROM staff ORDER BY salary, id LIMIT 1)` and carry `manager_id` forward. The step joins `staff s ON s.id = chain.manager_id` - matching the current row's manager, not its reports.
