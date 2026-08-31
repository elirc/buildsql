## Hint 1

"Yesterday" relative to a stream that stopped in 2023 means the last complete day of data: the day before the day max(ts) falls on. Anchor on the data, never on the wall clock.

## Hint 2

last_day = date_trunc('day', max(ts)); the window is ts >= last_day - interval '1 day' AND ts < last_day. Then count(*), count(DISTINCT customer_id), and a FILTER count of purchases in one pass.
