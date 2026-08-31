## Hint 1

RFC 9457 gives an error body five members. Four of them are easy; the two worth
thinking about are `type` — a URI that *identifies the kind of problem*, and the
thing a client should branch on — and `instance`, the path this particular
failure happened at. `about:blank` is the honest `type` when the status code
already says everything there is to say.

`req.originalUrl` is the `instance` you want.

## Hint 2

Routes should not build responses. Give yourself an error class that carries a
problem document, throw it from anywhere, and write **one** four-argument
`app.use((error, req, res, next) => ...)` at the bottom that turns it into a
response. Express 5 forwards a throw from a sync handler and a rejection from an
async one to exactly that place.

Two details the gate checks. The media type is `application/problem+json`, not
`application/json` — `res.type(...)` before `.json(...)` sets it. And an error
you did *not* mean to produce gets a generic detail: the thrown message here
contains a database password, and repeating a thrown message back to the client
is how it gets published. Log the real thing, answer with nothing.
