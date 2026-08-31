## Hint 1

Two different reductions of the same value: one changes the type to `date`,
the other keeps the timestamp and zeroes the minutes and seconds.

## Hint 2

`created_at::date` (or `cast(created_at AS date)`) and
`date_trunc('hour', created_at)`. Nothing is grouped here - one row per
order.
