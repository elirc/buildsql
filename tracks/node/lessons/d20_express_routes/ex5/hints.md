## Hint 1

An express application is itself a request handler, so `app.use(path, subApp)`
mounts one inside another. Mounting rewrites `req.url` to be relative to the
mount path before the sub-app sees it — which is exactly why the sub-app's
routes are written without the prefix.

## Hint 2

The three properties, on a request for `/api/v2/notes/9?expand=author` mounted
at `/api/v2`:

- `req.baseUrl` — the mount path;
- `req.originalUrl` — the whole thing the client sent, query string and all;
- `req.url` — what is left after the mount path is taken off, query string
  still attached.

Build the link back to a resource from `req.baseUrl + ...`, never from
`req.url`: a sub-app that hard-codes its own mount path stops being mountable.

The two middlewares differ only in which app they are registered on, and the
gate checks each header on both sides of the mount.
