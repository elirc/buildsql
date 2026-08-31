## Hint 1

A middleware is just a function of `(req, res, next)`, so a combinator that
returns one has exactly two branches: call the wrapped middleware, or do not.

## Hint 2

The branch that does not is where people lose the request. "Skip it" means
`next()` — calling nothing at all leaves the connection open until the client
gives up, and there is no error anywhere to tell you why.

The branch that does should hand your own `next` straight through. Do not wrap
it, do not swallow an argument: if the inner middleware calls `next(error)` the
error has to arrive at the error handler unchanged, and if it calls
`next("route")` that has to keep meaning what it means.
