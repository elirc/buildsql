## Hint 1

Nothing is read from a table here - the rows are manufactured. The function
takes a start, an inclusive stop, and a step.

## Hint 2

`generate_series(DATE '2023-01-01', DATE '2023-01-31', interval '1 day')`
returns timestamps; cast each one to `date`. Put it in `FROM` with an alias,
or call it directly in the SELECT list.
