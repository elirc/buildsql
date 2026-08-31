## Hint 1

The stub publishes the number 2, which is right exactly once — at the first
level of nesting. What a section actually publishes is not a fixed number but a
relationship: one more than whatever it found above it.

## Hint 2

A provider may call `useContext` on the very context it is about to provide.
Read the level, add one, publish that. Remember that HTML has no heading below
`h6`, so the number has to stop climbing there — an `<h7>` is not a heading at
all as far as the accessibility tree is concerned.
