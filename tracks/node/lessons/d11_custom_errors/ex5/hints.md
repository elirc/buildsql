## Hint 1

The constructor is ex1 again with an extra field and the options object passed
through to `super` so `cause` works.

`static is` is one `instanceof`. The `value is RetryableError` return type is
what makes it a **type guard**: after `if (RetryableError.is(e))` TypeScript
knows `e.code` exists, which is the whole reason to put it on the class instead
of writing the `instanceof` at each call site.

## Hint 2

`wrap` has three cases and only one of them is obvious:

- already a `RetryableError` — return it **as it is**;
- an `Error` — take its `message`, keep it as `cause`;
- anything else — `String(thrown)` for the message, still keep it as `cause`.

## Hint 3

The idempotence rule is the one worth understanding. A retry loop typically
wraps whatever it caught before deciding whether to retry — so without the early
return, attempt five produces an error five `cause` links deep, all saying the
same thing, and the useful root is buried.

Reuse your own `is` inside `wrap` rather than repeating the `instanceof`: one
definition of what "retryable" means, in one place.

The remaining decision: `wrap` keeps the original message rather than composing
a new one. Compare with d10's `withContext`, which composes. Both are right for
different jobs — be able to say which job is which.
