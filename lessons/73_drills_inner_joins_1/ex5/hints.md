## Hint 1

`events.customer_id` has no foreign key declared on it, but it still holds customer ids - a join key is a fact about your data, not only about the schema.

## Hint 2

Two different counts over the same rows: `count(*)` for events, `count(DISTINCT e.customer_id)` for the people behind them.
