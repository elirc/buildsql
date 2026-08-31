## Hint 1

Everything the `HAVING` needs is an aggregate of the group, so the whole rate expression can be written there - two aggregate calls and a division.

## Hint 2

Filter on the unrounded rate, and remember the `100.0`: with plain `100` the division is integer division and every month's rate collapses to 16.
