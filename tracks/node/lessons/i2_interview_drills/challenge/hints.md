## Hint 1

Read the whole prompt and budget the time before you write anything - that is
part of what a take-home is testing. Three pieces:

1. `GET /articles` with `page`/`perPage`, validated, returning
   `{ items, page, perPage, total }`;
2. an `ETag` on that response, with `If-None-Match` answered by a 304;
3. `POST /articles` with schema validation, 201 and a `Location` header.

Do them in that order and run the gate after each. A half-finished endpoint
that works beats three that nearly do.

## Hint 2

The ETag has to be derived from **the exact body you would have sent**, so
build the response object, serialise it once, hash that string, and reuse the
same string for the body:

```ts
const body = JSON.stringify(payload);
const etag = `"${createHash("sha1").update(body).digest("hex")}"`;
```

Set `etag` and `cache-control` before the branch so both the 304 and the 200
carry them. A 304 has no body at all.

Because the ETag depends on the payload, page 2 gets a different one, and
adding an article changes page 1s - which is exactly the behaviour the gate
checks, and exactly what makes caching correct rather than merely fast.

## Hint 3

The pagination validation is the same shape as lesson 09: 1-based `page`,
`perPage` between 1 and 50, both integers, `400 { error: "invalid_pagination" }`
otherwise.

For the 200 path, note that `res.json(payload)` would serialise the object a
*second* time - and express sets its own weak ETag, which will not match the
one you computed. Send the string you already hashed
(`res.setHeader("content-type", "application/json"); res.send(body);`).

Two decisions left for you: where the new id comes from (the gate expects
`a-4` after three seeded articles) and what a client that sends a stale ETag
should get. Then, if you have time left, say what you would add next -
filtering by tag, `Cache-Control: max-age`, cursor pagination - because "what
would you do with another hour" is always the last question.
