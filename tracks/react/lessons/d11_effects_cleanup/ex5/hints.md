## Hint 1
Two things are wrong with the stub and they have the same root: the effect
claims it depends on nothing. It reads `onOutside`, so a new `onOutside` has to
mean a new listener - and the old one has to go.

## Hint 2
`removeEventListener` only removes a listener if you hand it the identical
function reference, which is why the handler is declared inside the effect and
the cleanup closes over it. Keep the `ref` comparison for deciding what counts
as outside; a ref is the right tool for reaching a DOM node.
