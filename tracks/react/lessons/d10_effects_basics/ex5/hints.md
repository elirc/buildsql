## Hint 1
Work out why the second click does nothing before you change anything. The flag
is already `true`, so setting it to `true` is not a state change, so there is no
render, so there is no effect.

## Hint 2
An effect runs because something rendered. A purchase happens because a person
clicked. When the cause is a specific interaction rather than a state of the
world, the code belongs in the event handler - and then the flag has no job left
to do.
