## Hint 1

Two middlewares, two questions, and the whole exercise is refusing to let them
blur:

- **401 Unauthorized** — I do not know who you are. Retrying with credentials
  might work, so the response carries `WWW-Authenticate` to say how.
- **403 Forbidden** — I know exactly who you are, and no. Retrying will not
  help, so there is no challenge.

## Hint 2

The header is `Authorization: Bearer <token>` — a scheme, a space, a token.
Split on the space and check the scheme case-insensitively before you look at
the token; a `Basic` header is not a bearer token, and passing its payload to
`verify` is how a password ends up in a token lookup.

`verify` may return a promise, so the middleware is `async` — which is fine in
express 5: a rejected promise reaches the error handler on its own, and you do
not need a try/catch or a wrapper.

`requireRole` reads what `bearerAuth` attached. It is a separate middleware
precisely so that one route can require identity and another can require a role.
