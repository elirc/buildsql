## Hint 1

`wrapError` builds a new error whose message adds context in front of the
original one, and which keeps a reference to the original. Modern JavaScript
has a standard place for that reference, and it is not a property you invent:
the `Error` constructor takes an options object as its second argument.

`rootCause` follows that reference as far as it goes and returns the last
error in the chain.

## Hint 2

```ts
new Error("outer message", { cause: innerError });
```

That is the whole API. `error.cause` is then readable by anyone - loggers,
test frameworks and `console.log` all know to print it - which is why this
beats `error.originalError`, `error.inner` and every other house convention.

For `rootCause`, a `while` loop: as long as the current error has a `cause`
that is itself an `Error`, move to it. Note the type check: `cause` is typed
`unknown` because anything at all can be thrown, so a bare `while
(current.cause)` will not type-check and would happily return a string.

## Hint 3

```ts
export function rootCause(error: Error): Error {
  let current = error;
  while (/* the cause is an Error */) {
    current = current.cause;
  }
  return current;
}
```

Two decisions left: the loop condition (which needs `instanceof` to narrow the
type, not just a truthiness check) and what happens for an error with no cause
at all - walk through that case by hand before you run the gate. There is no
special case to write if your loop condition is right.
