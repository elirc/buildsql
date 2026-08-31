## Hint 1

Subtracting a `date` from a `date` gives a plain integer count of days. The
second column is that integer turned into years.

## Hint 2

`DATE '2023-11-14' - hired_on` is the day count. Divide by `365.0`, not by
`365` - integer division would throw the fraction away before `round` ever
sees it.
