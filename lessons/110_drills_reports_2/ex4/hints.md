## Hint 1

"The last three days" has to be computed from the data - anchor on max(ts), truncate to its day, and take that day plus the two before it. Hard-coding dates makes the report rot the moment the stream moves.

## Hint 2

A bounds CTE with date_trunc('day', max(ts)) AS last_day, then WHERE ts >= last_day - interval '2 days' AND ts < last_day + interval '1 day'. That upper bound includes all of the final day, whose data stops when the stream does.

## Hint 3

The pivot is five FILTER counts over GROUP BY date_trunc('day', ts) - lesson 17's grid with lesson 18's calendar math. Cross-joining the one-row bounds CTE (FROM events, bounds) is the tidy way to use the anchor in WHERE.
