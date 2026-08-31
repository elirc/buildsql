# Reading - node/d19_http_routing

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **turning a URL into a decision**, which is almost
entirely string handling and almost never treated as such. Every problem in this
set is built on the same two-line primitive — split on `/`, drop the empty
pieces — and the differences between them are questions about *when* you decode
and *what order* you try things in. Those two questions account for most routing
bugs in the wild: decoding before splitting turns one segment into two and hands
an attacker a directory separator, and trying routes in registration order makes
a literal route unreachable behind a parameter that was declared first. The last
two problems put the pieces together in the two shapes real routers take — a
ranked flat table (ex7) and a nested tree (ex8) — and both of them turn on the
same idea, that matching is a *search* and a search has to be able to fail and
back out.

## ex1 — split, then decode

**What it tested:** that `URL` already does the parsing, and that the order of
splitting and decoding is a decision rather than a detail.

**The classic mistake:** `decodeURIComponent(url).split("/")`. A `%2f` inside a
segment becomes a separator, one segment turns into two, and a path that was
meant to name a file now names a directory above it. Second most common:
reading the query with `Object.fromEntries(searchParams)`, which silently keeps
only the last value of a repeated key.

**Model answer:** `new URL(url, base)`, split the `pathname`, filter the empties,
map `decodeURIComponent` over what is left — and build the query by iterating
`searchParams` so a repeat can be promoted to an array.

## ex2 — a match has two ways to end

**What it tested:** the three segment kinds, and both ends of the walk.

**The classic mistake:** comparing only as far as the shorter of the two, so
`/orders/:id` happily matches `/orders/42/lines` and every nested route beneath
it becomes unreachable. The mirror image is treating a path that runs out early
as an automatic failure, which breaks optional segments.

**Model answer:** one loop over the pattern; the wildcard returns immediately;
running out of path is a match only if everything remaining is optional; and
after the loop, the path must have run out exactly when the pattern did.

## ex3 — specificity is a per-position score

**What it tested:** that "most specific first" is a total order you can compute,
not a feeling.

**The classic mistake:** sorting by length, or by counting parameters. Neither
one can express that `/orders` should beat `/orders/*rest` while still losing to
`/orders/:id` — that only falls out if "the pattern has ended" is itself a rank,
sitting between a param and a wildcard. And `sort()` mutates, so a router that
ranks its own table in place reorders the array its caller is still holding.

**Model answer:** score each position (literal 3, param 2, absent 1, wildcard 0),
compare position by position over the **longer** of the two, and tie-break on the
original index so equal patterns keep registration order explicitly rather than
by trusting the sort to be stable.

## ex4 — the same table, read the other way

**What it tested:** reverse routing — that a pattern is the single place a route
is written down, and links should be generated from it rather than typed again.

**The classic mistake:** encoding the wildcard with `encodeURIComponent` as one
value, which turns every separator into `%2F` and produces a link that matches
nothing. Close behind: emitting an absent optional as an empty string (giving a
trailing slash) or as the literal text `undefined`.

**Model answer:** build a list of output segments — literals through, params
encoded, wildcards split and each piece encoded — and sort the query keys so the
same inputs always produce the same string, which is what makes a link usable as
a cache key.

## ex5 — normalise without decoding

**What it tested:** dot-segment removal, and the discipline not to decode while
doing it.

**The classic mistake:** decoding first "so the comparison is fair". That is
exactly how `%2f` becomes a separator and the `..` you just removed comes back.
The other one is guarding `..` with a depth counter instead of letting `pop()`
on an empty array do nothing, which is the same rule with more places to be
wrong.

**Model answer:** strip the query, reduce the segments in one pass with `pop()`
for `..`, rebuild — and compare the result against the **path** rather than the
whole URL so a request carrying only a query string is not redirected.

## ex6 — the rewrite is a loan

**What it tested:** what mounting actually is. Express makes this look like a
feature; it is four lines of string manipulation and one `finally`.

**The classic mistake:** `pathname.startsWith(prefix)`, with no segment
boundary. `/api/v1extra` starts with `/api/v1`, so the inner handler is handed
the path `extra` and answers a route that has nothing to do with the request.
The other is never restoring `req.url`, which breaks everything registered after
the mount and produces a symptom somewhere else entirely.

**Model answer:** split the query off, test for the mount point exactly or the
mount point **plus a slash**, rewrite, and restore in a `finally` — recording
`originalUrl` only if it is not already set, so nesting keeps the outermost.

## ex7 — dispatch is three answers, not two

**What it tested:** assembling the pieces, plus the parts of a router that are
protocol obligations rather than features.

**The classic mistake:** trying routes in registration order, which makes
`/orders/new` unreachable behind `/orders/:id` and produces the folklore that
you must "declare specific routes first". The serious one is not awaiting an
async handler: the rejection becomes an unhandled rejection, the response is
never written, and the client hangs until its own timeout — a much worse failure
than a 500, and one that does not appear in the access log at all.

**Model answer:** keep the table sorted on registration; dispatch by walking it;
and when nothing matched, distinguish "no route for this path" (404) from "no
route for this method on this path" (405 or, for `OPTIONS`, 204) by collecting
the matching routes' methods once and reusing the set for both.

## ex8 — matching is a search

**What it tested:** the one thing that separates a real nested router from a
plausible one — backtracking.

**The classic mistake:** committing to the static child. `if (child) return
walk(child, ...)` looks obviously right, and it returns `null` for
`/orders/new/lines` even though the tree can serve it as `/orders/:id/lines`
with `id = "new"`. The bug only appears where a literal route and a param route
overlap, which is to say only in production.

**Model answer:** try the static child, **inspect the result**, and fall through
to the param child on `null`; build the chain and the merged params on the way
back up, so an abandoned branch costs nothing to unwind.

## Further reading

- [Node.js: `node:http`](https://nodejs.org/api/http.html) — `req.url`, `req.method`, and the fact that a request listener is just a function you can wrap.
- [MDN: the `URL` API](https://developer.mozilla.org/en-US/docs/Web/API/URL) and [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) — including `getAll()`, which is the repeated-key problem solved for you.
- [MDN: `encodeURIComponent()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) — what it escapes and, more usefully, what it does not.
- [MDN: 405 Method Not Allowed](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/405) and [the `Allow` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Allow) — the obligation ex7 is meeting.
- [RFC 3986 §5.2.4, Remove Dot Segments](https://www.rfc-editor.org/rfc/rfc3986#section-5.2.4) — ex5 as the specification writes it, including why there is nothing above the root.
