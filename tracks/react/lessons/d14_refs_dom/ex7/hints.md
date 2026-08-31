## Hint 1

Two things are missing, and both are about where focus is allowed to go. Tab
from the last control currently leaves the dialog for the page behind it; and
closing the dialog deletes the focused node, which drops focus on the document
body.

## Hint 2

A `keydown` handler on the dialog element sees every key pressed inside it,
because events bubble. You only have to intercept two cases: Tab while the last
control is focused, and Shift+Tab while the first one is. Both are
`preventDefault()` plus a `.focus()` on the other end.

## Hint 3

For the way out, remember what a ref on the opening button is worth: it is
still mounted when the dialog closes, so the handler that closes can also send
the cursor back to it. `document.activeElement` is how you ask what is focused
right now.
