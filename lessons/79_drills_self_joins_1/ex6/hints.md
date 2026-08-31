## Hint 1
The grain of the answer is the manager, but the rows being counted and averaged are the reports. Both come from `staff`, so this is a self-join followed by a `GROUP BY` on the manager's own columns.

## Hint 2
`FROM staff m JOIN staff e ON e.manager_id = m.id GROUP BY m.id, m.name, m.department`. The `>= 5` restriction is about the size of the group, so it is a `HAVING`, not a `WHERE` - and note that people with no reports never appear at all, which is what an inner join is for here.
