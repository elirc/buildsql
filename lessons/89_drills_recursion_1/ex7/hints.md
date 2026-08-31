## Hint 1

Anchor on the division heads themselves - the staff whose manager is the CEO - and carry their identity downwards as the recursion descends.

## Hint 2

`SELECT id AS head_id, id FROM staff WHERE manager_id = (SELECT id FROM staff WHERE manager_id IS NULL)` as the anchor; the step keeps `h.head_id` unchanged while moving `id` down a level.

## Hint 3

Join the result back to `staff` twice - once on the walked id for the person's own name and salary, once on `head_id` for the head's - then divide and round to 3.
