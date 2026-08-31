## Hint 1

`class NotFoundError extends Error`, a constructor taking the two pieces, and
`super(...)` with the composed message as the very first statement — the
language requires `super` before any use of `this`.

Everything else is three assignments.

## Hint 2

`this.name = "NotFoundError"` is the line people leave out, and it is the one
that matters most in practice. `name` is inherited as `"Error"`, and it is what
`console.log`, `util.inspect` and the first line of `.stack` all print — so
without it your carefully named class is invisible in every log you will ever
read.

Set it in the constructor, after `super`. Setting it before the stack is first
read is what makes the stack say `NotFoundError:` too.

Keeping `resource` and `id` as fields rather than only in the message is the
other half: a handler deciding what to do should never have to run a regular
expression over an English sentence.
