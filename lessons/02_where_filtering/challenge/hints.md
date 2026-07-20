## Hint 1
The bug: `AND` binds tighter than `OR`, so the query means
`pending OR (paid AND total > 1000)` — every pending order sneaks in, cheap
or not. Your fix must make the `total > 1000` apply to both statuses.

## Hint 2
Either wrap the OR: `WHERE (status = 'pending' OR status = 'paid') AND
total > 1000`, or collapse it: `WHERE status IN ('pending', 'paid') AND
total > 1000`. Pick one and write the full query.
