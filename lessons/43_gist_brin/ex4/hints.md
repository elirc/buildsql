## Hint 1
There is a function whose whole job is to summarise the block ranges a BRIN
index has not covered yet. It takes the index name as a text argument and
returns how many ranges it summarised.

## Hint 2
`SELECT brin_summarize_new_values('events_ts_brin_new_idx');`
