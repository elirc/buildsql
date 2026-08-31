## Hint 1
The stub already knows the field is empty and already renders a message. What it
never does is connect the two - nothing in the DOM says that the paragraph is
about that input.

## Hint 2
Two attributes make the connection: `aria-invalid` on the input, and
`aria-describedby` pointing at the `id` of the element holding the message. Both
have to disappear when the error does, which is why they are computed from the
error rather than set once.
