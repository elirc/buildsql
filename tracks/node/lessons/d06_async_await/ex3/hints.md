## Hint 1

The body is a `try`/`catch` with a `return` in each arm. What matters is what
sits *inside* the try.

`const promise = fn(); try { return [null, await promise]; } catch { ... }`
looks equivalent and is not: a function that validates its arguments and throws
does so at the call, which is now outside the try.

## Hint 2

In TypeScript, `catch (error)` gives you `unknown` (the project has
`useUnknownInCatchVariables` on), which is honest — a `throw` can carry a
string, a number, `undefined`, or an object that merely looks like an error.

So the catch arm has to *produce* an `Error`: keep it if it already is one,
otherwise build one from it. `String(thrown)` is a reasonable message, and the
gate checks exactly that case.
