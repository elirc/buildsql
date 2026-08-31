## Hint 1

One `for` over the stages, a `try` around each `run()`, and a list of the stages
that finished. Where you push onto that list is the first decision: pushing
before the `await` means a stage that threw counts as completed and gets rolled
back, which is exactly what the gate checks it must not.

## Hint 2

The unwind is a backwards loop over the completed list. Two things to skip and
one to catch:

- a stage with no `rollback` is skipped — check it is a function, because an
  optional method is `undefined`, not a no-op;
- each `rollback()` gets its own `try`, so one failure does not stop the rest of
  the unwind;
- and the failures are collected rather than thrown.

## Hint 3

The last requirement is the one that separates this from a textbook answer. The
caller needs *both* facts: what broke, and that the cleanup was incomplete. So
the original error is what you throw, and the rollback failures ride along on
it as a property.

Attaching a property to a caught value means being sure it is an object first —
anything can be thrown. And there is a design decision left for you: attaching
to the caught error mutates something you did not create. The alternative is
wrapping it in a new error with `cause`, which is tidier and changes what
`instanceof` says at the call site. Pick one and be able to defend it.
