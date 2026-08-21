## Hint 1

Two independent pieces.

The class: `extends Error`, call `super(message)` first, then set the extra
properties. The one people forget is `name` - without it, every log line and
every stack trace says `Error`, and the whole point of a custom class is that
the reader can see which failure this was.

The function: a rule, in two lines. Read the README's three-line
specification and translate it directly; do not invent extra cases.

## Hint 2

```ts
export class ValidationError extends Error {
  constructor(field: string, message: string) {
    super(message);
    this.name = "ValidationError";
    // ...the rest of the properties
  }
}
```

`super(message)` must come first - JavaScript will not let you touch `this`
before it. `status` is 400 for every validation failure and `isOperational` is
`true` for every validation failure, so they can be class field initialisers
rather than constructor arguments.

For `classifyError`, remember that the input is `unknown`: the first question
is whether it is an `Error` at all. A thrown string has no `isOperational`
property to read and no stack to log.

## Hint 3

The classifier is three lines:

```ts
if (!(error instanceof Error)) return /* ? */;
return (error as { isOperational?: boolean }).isOperational === true
  ? /* ? */
  : /* ? */;
```

The decision left to you is which side is which - and, more interestingly,
what the *default* should be for an ordinary `new Error("boom")` with no
marker on it. The README argues for one answer; the reasoning ("what do I know
about the state of this process?") matters more than the answer.
