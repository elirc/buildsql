## Hint 1
Wrap the whole expression - extraction and cast - in its own
parentheses inside the index column list.

## Hint 2
`CREATE INDEX events_payload_value_idx ON events (((payload ->> 'value')::int));`
