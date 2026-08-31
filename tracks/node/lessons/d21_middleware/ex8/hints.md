## Hint 1

A middleware sits *before* the handler, so by the time it runs there is no
response to store yet. The way to get one is the ex1 trick again: replace
`res.json` with your own function that records the body and then calls the
original.

`res.json()` is the last moment the body is a value rather than bytes. Take it
there.

## Hint 2

Four decisions, and each one is a line:

- only `GET` is ever served from the cache;
- only a 2xx is ever stored — a cached 404 outlives the reason for it, and every
  client keeps getting it long after the resource exists;
- a request with `cache-control: no-store` neither reads nor writes, so the
  entry that was already there survives untouched;
- expiry is `options.now()` against a stored `expiresAt`, never a timer.

The key has to include the query string, which is why `req.originalUrl` is the
right property and `req.path` is not.

## Hint 3

Invalidation is the half that makes it correct rather than merely fast. A
`POST` to `/notes` means everything stored under `/notes` is now a lie, so the
write clears it on the way *in* — before the handler runs, so there is no window
where a concurrent read repopulates the entry from stale data.

That needs the path stored alongside each entry, because the key is
`GET /notes?limit=10` and the thing being invalidated is `/notes`.

Two things are left for you. A production version has to wrap `res.send()` and
`res.end()` as well, since not every handler answers with `res.json()`. And
storing the headers along with the body — content-type, etag — is what turns
this from a demonstration into something you would deploy.
