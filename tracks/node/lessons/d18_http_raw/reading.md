# Reading - node/d18_http_raw

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **reading the request headers you did not ask for**.
A framework answers `Accept`, `Range`, `If-Match`, `Cookie` and `HEAD` on your
behalf, or quietly does not, and either way you find out at the worst possible
moment. Every problem here follows the same shape: a request header carries a
condition, the handler has to decide what that condition means, and the answer
is a status code that is not 200. The status codes are the content — 406, 412,
416, 428, 405, 206, 301, 308 — because picking the right one is what makes a
client able to recover on its own instead of retrying forever. The other thread
running through the set is that a response is a decision made *before* the first
byte leaves: once the headers are out, the status, the content-type and the
length are all fixed, which is why ex8 has to report a failure inside the body
it is already sending.

## ex1 — content negotiation is a weighted vote

**What it tested:** parsing a structured header into data before deciding
anything, and the two rules of `Accept` that everybody skips: wildcards match,
and `q` is a weight.

**The classic mistake:** `req.headers.accept.includes("json")`. It says yes to
`text/plain` from a client that listed `application/json;q=0` — the one type it
told you it could not read — and it has no answer at all for `*/*`. Nearly as
common: omitting `Vary: Accept`, after which a shared cache stores whichever
representation happened to be requested first and serves it to everyone.

**Model answer:** parse into `{ type, quality }` pairs, score each thing you
offer against the list, keep the best with a **strictly greater** comparison so
your own preference order breaks ties, and start the running best at `0` so a
`q=0` can never win.

## ex2 — a HEAD is a promise about a GET

**What it tested:** that HEAD is the same route, the same status and the same
headers as GET, and that `content-length` is a byte count.

**The classic mistake:** `payload.length`. It is right for ASCII and wrong for
every accented character, emoji or CJK glyph, so it survives the whole test
suite and then understates the size of one real document. The structural mistake
is treating HEAD as a separate endpoint, which drifts from the GET the moment
either one changes.

**Model answer:** build status, headers and body once, then branch on the method
at the single line where they differ — and count the body with
`Buffer.byteLength`, not `String.length`.

## ex3 — one header in, one header each out

**What it tested:** the asymmetry of the cookie protocol. Requests carry all
their cookies in one `Cookie` header; responses need a separate `Set-Cookie` per
cookie.

**The classic mistake:** `res.setHeader("set-cookie", ...)` twice, which
replaces rather than appends, so the second cookie is the only one the browser
ever sees — and the missing one is the session, so the symptom is "login works
locally". On the parsing side, `pair.split("=")` on a base64 value throws away
everything after the first padding character.

**Model answer:** split at the first `=` with `indexOf`, decode the value only,
and set both cookies in one call with an array.

## ex4 — ranges are inclusive, and off by one is silent

**What it tested:** three range syntaxes, the clamp, and the difference between
"I cannot satisfy this" and "I do not understand this".

**The classic mistake:** treating `bytes=-4` as "up to byte 4" instead of "the
last 4 bytes" — a suffix range has no start, and reading it as a start of zero
serves the wrong end of the file. The second is answering 416 for an unknown
unit, when the specification says to ignore it and serve the whole thing; the
third is `slice(start, end)`, which is one byte short every single time because
`Content-Range` is inclusive at both ends.

**Model answer:** parse into a three-way result — none, unsatisfiable, or a
concrete `{ start, end }` — before touching the response, so the 200, 206 and
416 branches cannot leak into each other.

## ex5 — the redirect codes mean different things

**What it tested:** that 301, 302 and 308 are three different promises, and that
a redirect must carry the query string forward.

**The classic mistake:** using 301 for everything. A 301 is cached by browsers
more or less permanently, so a temporary alias pinned with a 301 cannot be moved
back; and a 301 historically permits the client to turn a POST into a GET, which
is why 308 exists and why the trailing-slash canonicaliser has to use it.
Dropping the query string is the quieter one — every link keeps working and
silently loses its filters.

**Model answer:** one helper that builds the `Location` from the canonical path
plus `url.search` using `URL`, and a `switch` that picks the code deliberately —
with the canonical path itself answering 200, because a canonicaliser that
cannot recognise its own output is a redirect loop.

## ex6 — the lost update, caught

**What it tested:** optimistic concurrency. Lesson 08 used `If-None-Match` to
avoid *sending* a body the client already had; this uses `If-Match` to avoid
*accepting* a write based on a version that is no longer current.

**The classic mistake:** treating a missing `If-Match` as permission. If the
header is optional, every buggy client skips it and the protection is worth
nothing — which is what 428 Precondition Required exists to say. The other is
returning the *old* ETag after a successful write, so the next writer believes
it is up to date and the whole scheme silently stops working.

**Model answer:** version counter in the closure, ETag as a quoted string built
from it, and the three PUT outcomes checked in order — no header is 428, a
non-matching header is 412 and changes nothing, `*` or a match writes and bumps
the version.

## ex7 — resolve, then judge

**What it tested:** a static file server, which is four decisions — method,
containment, existence, content-type — and one of them is a security boundary.

**The classic mistake:** checking the raw URL for `..` and then decoding. The
client normalises `/../secret.txt` away before it is ever sent, so the attack
that reaches you is `/..%2fsecret.txt`, and any check performed before
`decodeURIComponent` sees nothing wrong with it. The second mistake is
forgetting to strip the leading slash, because `path.resolve(root, "/index.html")`
discards the root entirely.

**Model answer:** decode, strip the leading separators, resolve once against the
root, and ask one question — is `path.relative(root, target)` non-empty,
relative, and not starting with a `..` **segment**.

## ex8 — the status code is gone

**What it tested:** streaming a response whose length is unknown, and what is
left to you once the headers have been flushed.

**The classic mistake:** buffering the whole stream and calling
`res.end(everything)`, which is not a stream at all and defeats the point; or
setting a `content-length`, which truncates it at whatever you guessed. And when
the source fails: reaching for `res.writeHead(500)` and getting
`ERR_HTTP_HEADERS_SENT`, because the 200 left the building with the first event.

**Model answer:** a pure `frame()` that turns one event into its lines — with
each line of `data` on its own `data:` field and a blank line to dispatch — and
a `for await` wrapped in `try`/`catch`/`finally`, where the catch writes an
`error` event and the finally always ends the response.

## Further reading

- [Node.js: `node:http`](https://nodejs.org/api/http.html) — `ServerResponse.writeHead`, `setHeader` with an array, and what Node does with the body of a HEAD response.
- [MDN: `Accept`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept) — the grammar ex1 parses, including quality values and wildcards.
- [MDN: `Range`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Range) and [`Content-Range`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Range) — the inclusive offsets and the `*/size` form of a 416.
- [MDN: `If-Match`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/If-Match) — and [428 Precondition Required](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/428), which is the code that makes the check compulsory.
- [MDN: Redirections in HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections) — why 308 exists next to 301, and what a client is permitted to do to your method.
- [MDN: Using server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) — the wire format ex8 produces, from the client's side.
