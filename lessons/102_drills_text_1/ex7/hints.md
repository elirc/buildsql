## Hint 1

Three pieces: the first character, a run of stars as long as the hidden
part, and everything from the `@` onwards. Locate the `@` first; everything
else is arithmetic around that position.

## Hint 2

`repeat('*', position('@' IN email) - 2)` is the star run - count it on
`user1@example.com` to convince yourself of the `- 2`. Then glue the pieces
with `||`, or replace the slice in place with `overlay`.

## Hint 3

`substring(email FROM position('@' IN email))` returns the `@` and
everything after it, so the three pieces reassemble to the original length.
