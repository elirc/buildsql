## Hint 1
Same shape plus the opclass name after the column, inside the parens.
The README's second concept line is the exact form.

## Hint 2
```sql
CREATE INDEX events_payload_idx
  ON events USING gin (payload jsonb_path_ops);
```
