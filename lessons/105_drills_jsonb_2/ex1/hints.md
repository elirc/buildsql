## Hint 1

The payload is a JSONB document and you want one key out of it as plain text - this is the double-arrow operator from lesson 19.

## Hint 2

payload ->> 'path' returns text; payload -> 'path' would return JSONB, which prints with quotation marks around it and would not match. Filter with WHERE id <= 15 and ORDER BY id.
