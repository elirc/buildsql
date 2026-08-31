## Hint 1

Two things are wrong and neither is about reading the values. First: after a
draft has been sent, the boxes still hold it. Second: press Discard and watch
what `onSend` does — read the HTML spec's default for a `<button>` with no
`type` attribute.

## Hint 2

`form.reset()` empties every control in one call, and the ref you already have
is the node to call it on. For the second bug, one attribute on one button is
the entire fix.
