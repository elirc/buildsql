## Hint 1

`age()` returns years, months and days. Whole months of tenure means the
years converted to months plus the months field - the days are dropped on
purpose.

## Hint 2

`extract(year FROM age(...)) * 12 + extract(month FROM age(...))`, cast to
`int`. Writing `age()` twice is fine; a `LATERAL` subquery naming it once is
tidier.
