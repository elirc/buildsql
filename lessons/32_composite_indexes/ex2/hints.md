## Hint 1
One equality (`customer_id`), one range (`ts`). Rule 1: equality first.

## Hint 2
`CREATE INDEX events_customer_ts_idx ON events (customer_id, ts);`
