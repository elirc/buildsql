## Hint 1
`split_part(string, delimiter, n)` returns the nth field. The index is
one-based, not zero-based.

## Hint 2
The delimiter is a single space in quotes. If every second column comes
back empty you probably passed `0` as the index, or split on the wrong
character.
