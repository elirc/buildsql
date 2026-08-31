## Hint 1

Recursion (lesson 14) with bookkeeping: walk each subtree downward while remembering WHICH of the CEO's direct reports it started from, then count per starting point.

## Hint 2

Seed the recursive CTE with the CEO's direct reports (manager_id = the CEO's id - the one row whose manager_id IS NULL), carrying each one's id and name along as anchor columns that never change during recursion.

## Hint 3

The recursive step joins staff ON s.manager_id = current member id, copying the anchor columns through. Afterwards GROUP BY the anchor (id and name - two people can share a name) and count(*); the direct report counts themselves. Order by subtree DESC with name as tie-break.
