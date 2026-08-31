## Hint 1
Every member of staff has to appear, and exactly one of them has no manager at all. An inner self-join would silently drop that person.

## Hint 2
`LEFT JOIN staff m ON m.id = e.manager_id`. The gap column then takes care of itself: arithmetic involving NULL is NULL, so the CEO's row reports NULL for both the manager name and the gap without any special case.
