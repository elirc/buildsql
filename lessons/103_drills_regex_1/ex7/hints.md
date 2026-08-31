## Hint 1

One pattern, three parenthesised groups, anchored at both ends so the whole
name has to fit the shape `word word number`.

## Hint 2

`regexp_match(name, '^(\S+) (\S+) ([0-9]+)$')` returns a `text[]` holding
the captures. Subscript it: `[1]`, `[2]`, `[3]` - PostgreSQL arrays are
1-based and the array holds only the groups, not the whole match.

## Hint 3

The third capture is text, so cast it to `int` for the `tag` column. The
other way round is `regexp_replace` with the backreferences `\1`, `\2`,
`\3` as the replacement string.
