## Hint 1
One boolean decides two separate things on the screen: whether the text is
there at all, and what the button is called. Neither of them is a second piece
of state - both are read off the same one.

## Hint 2
Hidden here means not rendered, not rendered-and-invisible: the gate asks
whether the text is in the document. A conditional that returns `null` in the
false branch is the smallest way to say that.
