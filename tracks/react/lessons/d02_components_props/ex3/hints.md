## Hint 1
One boolean prop decides three separate things: two attributes and a piece of
text. Write the internal case first and make sure it has *nothing* extra on it,
then add what the external case needs.

## Hint 2
An attribute whose value is `undefined` is not rendered at all, so a ternary
that yields `undefined` is how you say "leave this attribute off". The warning
is text inside the link, which is why it lands in the accessible name.
