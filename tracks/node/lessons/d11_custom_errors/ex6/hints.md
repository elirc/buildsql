## Hint 1

`AggregateError`'s constructor is `(errors, message)` — the opposite order from
`Error`, which catches everyone once. Everything else is the same pattern as
ex1: `super(...)` first, then `name`, then your own field.

The summarising message matters more than it looks. Concatenating four failure
messages into one line produces something nobody reads; a count plus the list on
`.errors` produces something a log aggregator can group.

## Hint 2

Copy the array on the way in. `AggregateError` builds its own array from the
iterable, so a spread is belt and braces — but say it anyway, because "the
errors I reported changed after I reported them" is a genuinely awful debugging
session and the guarantee should be visible in the code.

## Hint 3

`codes()` is a `Set` for distinctness, a `typeof` check because `code` is
`unknown` on an arbitrary error, and a `sort()` so the output does not depend on
the order the failures happened to arrive in — which is what makes it usable as
an alert key.

The remaining decision is what `codes()` should do about an error whose `code` is
a number, which some libraries do. This version ignores it. Decide whether
ignoring or coercing is more honest.
