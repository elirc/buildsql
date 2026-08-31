## Hint 1

The driving set does not have to be a table - any subquery works on the left of a LATERAL. Here it is the five distinct ratings, pulled from the million-row table itself.

## Hint 2

FROM (SELECT DISTINCT rating FROM reviews) r CROSS JOIN LATERAL (... WHERE rv.rating = r.rating ORDER BY rv.created_at DESC, rv.id DESC LIMIT 3) t. Review timestamps land in the same second constantly at this volume, so the id tie-break decides between them.
