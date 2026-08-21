## Hint 1
`customer_id` has 50,000 distinct values; `event_type` has five. Lead
with the selective one.

## Hint 2
`CREATE INDEX events_customer_type_idx ON events (customer_id, event_type);`
