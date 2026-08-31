## Hint 1
The stub asks the same question twice and answers a third question - whether
to show Sign in - not at all. Signed in and signed out are alternatives, so
they want one decision, not three.

## Hint 2
Either a ternary around the whole thing or an early `return` for the
signed-out case. The early return usually reads better here, because the two
branches have different numbers of elements in them.
