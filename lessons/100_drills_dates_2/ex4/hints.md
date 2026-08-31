## Hint 1

`date_trunc` has no 15-minute bucket, so build one: the start of the hour
plus however many whole quarter-hours have passed inside it.

## Hint 2

`date_trunc('hour', ts) + (floor(extract(minute FROM ts) / 15))::int *
interval '15 minutes'`. The alternative is to floor the epoch seconds to a
multiple of 900 and convert back with `to_timestamp`.

## Hint 3

Group by the whole bucket expression (or by its ordinal), not by the minute
- and remember the cast before multiplying an interval, because `extract`
returns `numeric`.
