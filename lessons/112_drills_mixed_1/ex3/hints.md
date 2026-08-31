## Hint 1

Three topics welded: a date filter on signups, a country filter, and an anti-join (lesson 13) whose condition is not "no orders" but "no orders that survived".

## Hint 2

NOT EXISTS with the status condition INSIDE the subquery: no order of theirs with status <> 'cancelled'. A customer whose only orders were cancelled must appear - putting the status test outside the anti-join silently changes who counts.
