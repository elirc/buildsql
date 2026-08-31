## Hint 1

Four paths, four answers. The only shared machinery is the `Location` value,
which is the canonical path plus **this request's** query string — write that
once as a helper and the rest is a `switch`.

## Hint 2

Build the location with `new URL(target, base)` and read back
`pathname + search`. Concatenating `target + req.url.slice(...)` works until the
day the target itself grows a query string, and then it produces
`/a?x=1?y=2`, which no client can parse and no test you wrote will catch.

The status codes are the content of this problem, so pick them deliberately:

- 301 permanent, and the client is allowed to rewrite the method to GET
- 308 permanent, and the method must survive — which is why the trailing-slash
  fix uses it
- 302 temporary, for a pointer that will mean something else tomorrow

And the canonical path itself must answer, not redirect. A canonicaliser that
does not recognise its own output is an infinite loop, and the browser is the
one that notices.
