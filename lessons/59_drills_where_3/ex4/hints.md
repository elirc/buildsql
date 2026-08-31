## Hint 1
There is a case-insensitive twin of `LIKE`. It is one letter longer.

## Hint 2
Wildcards on both sides mean "contains". `LIKE '%blanket%'` with a plain
`LIKE` would return nothing here, because the stored names are
capitalised - which is the whole reason the prompt specifies the matching
rule.
