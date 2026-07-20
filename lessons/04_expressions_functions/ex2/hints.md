## Hint 1
Column 1 is three concatenations: name, `' ('`, department, `')'`. Column 2
is one `round` call — the negative-digits form from the concept section.

## Hint 2
`name || ' (' || department || ')' AS badge` and
`round(salary, -3) AS salary_band`. All text pieces here are already text,
so no casts needed. Table is `staff`.
