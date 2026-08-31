## Hint 1
`setInterval` returns a handle for a reason. Nothing else in the browser knows
that your component has gone.

## Hint 2
Keep the handle in a `const` inside the effect and clear it from the cleanup.
The updater form of `setSeconds` matters too: the callback is created once and
would otherwise keep adding one to the same captured value forever.
