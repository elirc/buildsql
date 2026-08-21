## Hint 1

`req.url` is not a path - it is a path *and* a query string
(`/search?q=node&limit=2`). Comparing it to `"/search"` fails the moment a
parameter is present, which is why ex1's exact match is not enough here.

Node has no `req.query`. That is an express thing. What you have is the
standard `URL` class, and the trick is that it needs a base to parse a
relative URL.

## Hint 2

```ts
const url = new URL(req.url ?? "/", "http://localhost");
url.pathname;        // "/search"  - no query string
url.searchParams;    // a URLSearchParams
```

The base is a formality: the hostname is thrown away, you only wanted the
parsing. (`http://localhost` is the usual placeholder; some codebases build a
real one from the `Host` header.)

`URLSearchParams` gives you `get(name)` - the first value or `null` - and
`getAll(name)` - every value as an array. Percent-decoding is already done.

## Hint 3

```ts
const q = url.searchParams.get("q");
if (/* missing or empty? */) { sendJson(res, 400, { error: "q is required" }); return; }

const rawLimit = url.searchParams.get("limit");
const limit = rawLimit === null ? /* default */ : Number(rawLimit);

sendJson(res, 200, { q, limit, tags: /* which method? */ });
```

Three decisions left. Note that everything in a query string is a string:
`limit` has to be converted, and `"2"` is not `2` to the gate's `toEqual`.
And think about whether `?q=` with no value should count as present - the gate
does not test it, and a real API should decide on purpose.
