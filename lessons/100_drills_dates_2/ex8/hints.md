## Hint 1

A session boundary is a property of one row: either it is the customer's
first event, or the gap since their previous event is too large. Count the
boundaries and you have counted the sessions.

## Hint 2

`lag(ts) OVER (PARTITION BY customer_id ORDER BY ts, id)` in a CTE, then a
conditional count in the outer query. The partition is what stops a gap from
being measured across two different customers.

## Hint 3

The first event of each customer has a NULL previous timestamp, and
`NULL > interval '30 minutes'` is NULL rather than true - so the predicate
needs an explicit `prev_ts IS NULL OR ...` branch or the count comes out one
short for everybody.
