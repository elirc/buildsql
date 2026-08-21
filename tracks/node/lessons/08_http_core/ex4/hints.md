## Hint 1

Two halves. The first is turning `/orders/42` into the id `42`: take the
pathname (ex2 showed you how to get it without the query string), split it on
`/`, drop the empty pieces, and check you have exactly the two segments you
expect. Exactly two - `/orders/1/extra` has three and must 404.

The second half is the conditional GET, which is a three-line protocol most
people have only read about.

## Hint 2

The conditional GET:

1. compute an **ETag** - any string that changes when the body changes. A hash
   of the serialised body is the usual choice: `createHash("sha1").update(body)
   .digest("hex")`, wrapped in double quotes because the header format asks for
   them.
2. always send the `ETag` header (and `Cache-Control: no-cache`, which means
   "you may cache this, but revalidate before using it" - not "do not cache").
3. if the request's `if-none-match` header equals your ETag, the client
   already has this exact version: reply `304` with **no body** and stop.

Request headers arrive lowercased in `req.headers`, so it is
`req.headers["if-none-match"]`.

## Hint 3

```ts
const body = JSON.stringify(order);
const etag = /* build it */;
res.setHeader("etag", etag);
res.setHeader("cache-control", "no-cache");

if (/* the client already has it? */) {
  res.writeHead(304);
  res.end();
  return;
}
// ...otherwise the full 200
```

Two decisions left: the ETag value and the comparison. Do not send a body with
the 304 - Node will refuse, and the whole point is that the bytes are not sent
twice. Note the headers are set with `setHeader` *before* the branch, so both
paths carry them; `writeHead` merges what you set earlier with what you pass
to it.
