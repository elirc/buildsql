## Hint 1

The interview question is "what type does TypeScript give the variable in a
`catch` block, and why?". Since 4.4, with `useUnknownInCatchVariables` (part of
`strict`), it is `unknown` - because `throw` accepts any value at all, and
plenty of libraries throw strings, numbers or plain objects.

So the parameter type has to be `unknown`, and the body has to earn its way to a
string.

## Hint 2

Three cases, in this order: a real `Error` (use its `message`), a thrown string
(use it as-is), anything else (a fixed fallback the README names).

`error instanceof Error` is the check for the first, and it is worth knowing its
weakness: across realms - an iframe, a worker, Node's `vm` - an error from the
other side fails `instanceof` even though it is a perfectly good `Error`.

## Hint 3

Parameter `unknown`; `instanceof Error` returns `error.message`;
`typeof error === "string"` returns `error`; everything else returns
`"unknown error"`.

Left to you: whether to add a duck-typed fallback - an object with a string
`message` property - before giving up. Production error handlers usually do,
which is a good thing to mention when you answer this one.
