## Hint 1

Four branches, in a deliberate order: already an `Error`, a string, an
object with a string `message`, everything else.

The first branch returns the **same object**. Rebuilding it would give you a
stack trace pointing at this function instead of at the code that failed, which
is the single most useful thing an error carries.

## Hint 2

`typeof null === "object"`, so the duck-typing branch needs a null check before
it reads `.message`. And `message` has to be a *string* — an object with
`message: 42` is not the shape you are looking for.

For the last branch, `String(thrown)` rather than a template literal: template
literals throw on a Symbol, and `String()` does not. It is a small thing and it
is exactly the sort of small thing that turns an error handler into a second
error.

## Hint 3

Use the `cause` option — `new Error(message, { cause: thrown })` — for the two
branches where the original carried more than the message. The string branch
does not need it: the string *was* the whole of it, and setting a cause there
would be noise.

The remaining decision is `instanceof` itself. It fails for an error that
crossed a realm boundary — a `vm` context, a worker, some bundler setups — which
is exactly what the duck-typing branch quietly rescues. Know that you are
relying on it.
