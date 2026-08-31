## Hint 1

Two JSONB reads in one WHERE: an equality on the extracted path (or a containment test - either works) plus the event-type filter, then a cast on the way out for the value column.

## Hint 2

payload ->> 'path' = '/p/7' AND event_type = 'purchase'; select (payload ->> 'value')::int so the column is a number, not text. Product 7's page is exactly the string '/p/7' - no pattern matching needed.
