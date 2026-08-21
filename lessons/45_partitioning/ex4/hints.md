## Hint 1
`ALTER TABLE <parent> DETACH PARTITION <child>;` - no data is copied or
deleted.

## Hint 2
`ALTER TABLE events_p DETACH PARTITION events_p_oct;`
