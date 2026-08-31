## Hint 1

Express tells error handlers apart from ordinary middleware by **arity**: four
declared parameters means "error handler". Once a request is in the error path
express walks the stack looking only for four-argument functions, and once it is
not, it skips them.

That is the whole reason `(err, req, res, next)` must keep all four names even
when you do not use `next` — dropping it turns your error handler into a
middleware that never runs.

## Hint 2

Two handlers, in order. The first knows a specific failure and answers it; for
anything else it calls `next(error)` and the request keeps travelling — past the
ordinary middleware in between, which is not part of the error path at all — to
the last handler, which logs the real error and tells the client nothing.

The gate calls `finalErrorHandler` directly with a fake `res`, so it has to be
exported on its own rather than written inline in `createApp()`.

## Hint 3

The `res.headersSent` branch is the one people have never thought about. If some
bytes have already gone out, the status line is decided and gone; calling
`res.status(500).json(...)` now either throws or appends garbage to a body the
client is already parsing.

The correct move is `next(error)`. Express's own final handler takes it from
there and destroys the connection, which is honest: the client sees a truncated
response and knows something went wrong, instead of a valid-looking one that
lies.

What you still have to decide is whether the last handler should log *every*
error it sees or only the ones it is inventing a 500 for — the gate settles one
of those, and a reviewer will ask about the other.
