## Hint 1

You need the index of a character inside a string, and then a little
arithmetic on it. The index is 1-based.

## Hint 2

`position('@' IN email)` - or `strpos(email, '@')`, the same thing with a
function-style argument order. The domain length is the total length minus
that position, because the `@` itself is not part of the domain.
