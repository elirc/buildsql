## Hint 1

The panel is rendered by the component whose state keeps changing, so it is
re-created every time that state moves. Nothing about the panel depends on the
tick count — the only connection between them is where the JSX happens to be
written.

## Hint 2

Move the panel's JSX up into a component that has no state, and hand it to the
ticker as `children`. React compares the children element with the previous one
by identity, and a component that never re-renders keeps handing over the same
element — so the subtree is skipped.

## Hint 3

Note what you did *not* need: `memo`, `useMemo`, or a dependency array. This is
a structural fix, which means there is nothing to keep in step later.
