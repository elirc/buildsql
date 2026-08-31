## Hint 1

A spine does not have to be made of dates: twenty-four integers are a
perfectly good axis, joined against the hour extracted from each order.

## Hint 2

`generate_series(0, 23)` on one side; on the other, the orders of
2023-05-10 grouped by `extract(hour FROM created_at)::int`. Keep the day
restriction on the orders side of the join, never in the outer `WHERE`.

## Hint 3

If you prefer timestamps, generate the 24 hourly slots of that day and join
on `date_trunc('hour', created_at) = slot`, then report
`extract(hour FROM slot)::int`. Either way the empty hours must survive.
