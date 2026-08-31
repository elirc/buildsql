## Hint 1

A half-open June, one group per calendar day, and a formatted weekday name
alongside it. Both non-aggregated columns have to appear in the `GROUP BY`.

## Hint 2

`to_char(created_at, 'Day')` pads the name to nine characters - wrap it in
`trim()`, or use the `FM` prefix (`'FMDay'`) which suppresses the padding.
The range is `>= DATE '2023-06-01' AND < DATE '2023-07-01'`.
