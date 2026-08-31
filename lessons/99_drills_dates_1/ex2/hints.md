## Hint 1

The output column is text, not a date - a label for a report, produced by a
formatting function rather than by truncation.

## Hint 2

`to_char(hired_on, 'YYYY-MM')`. Case matters in the pattern: `MM` is the
month, `mm` also works but `mi` would give you minutes.
