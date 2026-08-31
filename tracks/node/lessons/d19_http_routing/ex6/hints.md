## Hint 1

Three steps: decide whether this request belongs to the mount, rewrite `req.url`
to what the inner handler should see, and put it back when the handler returns.
The put-back belongs in a `finally`.

## Hint 2

Split the query off before you compare anything — the prefix applies to the
path, not to the whole of `req.url`, and the query has to be reattached to
whatever is left.

The membership test is two cases, and the second one is the trap:

- the path **is** the mount point (with or without a trailing slash) → the inner
  handler sees `/`
- the path starts with the mount point **plus a slash** → the inner handler sees
  the rest

That extra slash is the entire difference between a correct mount and one where
`/api/v1extra` is handed to the inner handler as `extra`.

`originalUrl` should only be set if it is not already there, so that nesting two
mounts still records the address the client actually asked for.
