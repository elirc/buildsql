## Hint 1

The stub borrows the parent's ref to do its own work, so a box used without a
ref has a Clear button that does nothing. A component's own behaviour cannot
depend on a prop the caller was never required to pass.

## Hint 2

Keep a ref of your own for the internal work, and give the node to the parent
as well. The `ref` attribute accepts a function, and a function can write to
two places — remember that a `Ref<T>` prop may itself be a callback, an object
with `.current`, or absent entirely.
