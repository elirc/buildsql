## Hint 1
The operator class name goes after the column, inside the parentheses.

## Hint 2
`CREATE INDEX events_payload_pathops_idx ON events USING gin (payload jsonb_path_ops);`
