## Hint 1

The step does not have to be a day. A month step is calendar-aware, so it
lands on the 1st of every month without any arithmetic on your part.

## Hint 2

`generate_series(DATE '2023-01-01', DATE '2023-12-01', interval '1 month')`,
then `to_char(..., 'Mon')` for the label - the pattern's capitalisation is
copied into the output, so `'Mon'` gives `Jan` and `'MON'` gives `JAN`.
