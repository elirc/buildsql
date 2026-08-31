## Hint 1

Read the three requirements as one sentence: whatever `fn` does — return a
value, return a promise, or throw — the wrapper hands back a promise and never
throws.

There is a language feature that turns exactly that guarantee on for a whole
function body. You have been using it all week.

## Hint 2

An `async` function *always* returns a promise, and an uncaught throw anywhere
in its body becomes a rejection of that promise rather than an exception at the
call site. Returning a promise from it is adopted rather than nested.

So the answer is a one-line arrow, and the exercise is being sure enough of the
semantics to write one line instead of a `try`/`catch` around a
`Promise.resolve`.

`Promise.resolve().then(() => fn(...args))` also works and costs an extra
microtask hop. Know why it is different, then decide whether you care.
