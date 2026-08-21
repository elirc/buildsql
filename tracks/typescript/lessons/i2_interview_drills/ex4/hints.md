## Hint 1

Debounce is the interview classic: after a burst of calls, run the function
once, `waitMs` after the *last* one. Every earlier call's pending timer is
cancelled.

The typing half is `Parameters<F>` - the wrapper takes exactly what the wrapped
function takes, and the gate checks that a wrong argument type is rejected.

## Hint 2

```ts
function debounce<F extends (...args: any[]) => void>(
  fn: F,
  waitMs: number,
): (...args: Parameters<F>) => void { ... }
```

The body closes over one timer handle. On each call: clear the pending timer if
there is one, then set a new one that calls `fn(...args)`.

Use `ReturnType<typeof setTimeout>` for the handle's type - it is `number` in
the browser and a `Timeout` object in Node, and this spelling is right in both.

## Hint 3

Declare the timer outside the returned arrow, `clearTimeout` when it is set,
then assign a fresh `setTimeout` whose callback clears the handle and calls
`fn(...args)`.

Left to you: whether the *first* call should fire immediately (a "leading edge"
debounce) and whether the wrapper should expose a `cancel`. Lodash offers both;
mentioning them shows you know which variant you built.
