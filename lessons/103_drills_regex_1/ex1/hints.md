## Hint 1

The match operator returns a boolean, so it can be a column. The pattern has
to be anchored at the start and has to say "exactly two digits".

## Hint 2

`email ~ '^user[0-9]{2}@'`. The `{2}` is the repetition count; `^` pins the
match to the beginning, and the `@` after the digits stops a three-digit id
from matching.
