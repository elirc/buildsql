# Reading - node/d23_rest_patterns

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **answering with the truth**, in the vocabulary HTTP
already has. Almost every problem in this set has a version that "works" — the
data ends up right, the client eventually copes — and is still wrong, because
the response said something that was not so: a 200 for a resource that was
created, an empty list for a parent that does not exist, a 400 for a request
that was perfectly well formed, a page that silently skipped a row. Two habits
run through all eight answers. The status code is chosen from what *this
request* did rather than from whether the handler threw, which is why 201 and
200 differ on the same PUT and why 409 is not 400. And the failure body has one
shape across the whole service, because a client that has to parse two error
formats will only ever handle one of them. Validation is kept deliberately thin
here — that was d22 — so that nothing distracts from the codes.

## ex1 — four verbs, four contracts

**What it tested:** that you know PUT is not "update" and PATCH is not "upsert".

**The classic mistake:** treating PUT as a partial update, so a body that omits
`done` leaves the old value in place. That makes the verb unusable for its one
real purpose — sending a whole representation and knowing what is there
afterwards — and it makes two identical PUTs able to produce different states.
Close behind: PATCH creating the resource when it is missing, which turns a
typo in an id into a new record nobody meant.

**Model answer:** build the replacement object from the request alone for PUT,
merge field by field for PATCH, and pick 201 versus 200 by whether the id was
already in use — with `Location` on every creation, whichever verb caused it.

## ex2 — the client knows what it needs

**What it tested:** projection driven by a whitelist, and the difference between
refusing a request and silently under-delivering.

**The classic mistake:** validating the requested fields against
`Object.keys(task)`. It looks equivalent and it means the day a
`passwordHash` joins the record, `?fields=passwordHash` starts working. The
second is ignoring an unknown field name and returning 200 — the client waits
for a key that is never coming, and the bug surfaces as "the UI shows blank"
three services away.

**Model answer:** a `FIELDS` constant that is the contract, one function that
turns the parameter into "everything" or a validated list, and one that projects
— with `id` seeded first so it is present exactly once however it was asked for.

## ex3 — a standard error body

**What it tested:** RFC 9457, and the discipline that an unexpected error tells
the client nothing.

**The classic mistake:** `res.status(500).json({ error: error.message })`. The
thrown message here is a connection failure containing a database password, and
that response publishes it — to a browser console, a log aggregator, a bug
report screenshot. The other one is skipping `type`, leaving clients to
recognise a problem by matching its `title` with a regular expression that
breaks the first time somebody improves the wording.

**Model answer:** an error class carrying a problem document, one four-argument
`app.use` at the bottom that renders it as `application/problem+json`, and a
default branch that logs everything and says nothing.

## ex4 — a cursor is a position, not a count

**What it tested:** keyset pagination, and why the cursor is opaque.

**The classic mistake:** `?page=2` translated to an offset. The list is changing
while the client reads it, so a row inserted before the cursor shifts everything
down and page 2 repeats an item page 1 already showed — or a deletion shifts
everything up and page 2 skips one entirely. Nobody notices, because the pages
look plausible. The other mistake is a readable cursor: the moment a client can
decode it, a client will construct one, and the encoding is now your public API
forever.

**Model answer:** remember the last id served, base64url it so it survives a
query string, and treat a cursor naming nothing as a 400 — an empty page would
say the collection had ended, and starting over would loop the client forever.

## ex5 — a child is not addressable on its own

**What it tested:** the two checks a nested route owes, and the fact that they
are different checks.

**The classic mistake:** `tasks.find((t) => t.id === req.params.id)` inside a
route mounted under `/projects/:projectId`. It works in every test where you
happen to use the right parent, and it is the bug that shows one customer
another customer's data through a url they guessed. The other is answering a
missing parent with `[]`, which asserts that the project exists and is empty —
two false statements for the price of one.

**Model answer:** one `requireProject` middleware in front of every nested
route so the parent check cannot be forgotten on one of them, and a lookup that
matches the id **and** the parent.

## ex6 — the network eats responses

**What it tested:** idempotency keys, and the fact that the interesting state is
the *response*, not a flag.

**The classic mistake:** recording only that a key was used, then answering a
replay with 200 and an empty body — the client cannot tell what happened and has
no id for the resource it created. The sharper one is skipping the fingerprint:
the same key with a different body then replays the *old* payment, telling the
client that its 250 succeeded when nothing was ever charged.

**Model answer:** store `{ fingerprint, status, body }` per key; replay it
verbatim with a header saying so; 409 on a mismatch; and no key means no
promise, because two identical requests really can be two intentional payments.

## ex7 — check everything, then apply everything

**What it tested:** atomicity without a transaction, and choosing an identifier
that always exists.

**The classic mistake:** one loop that validates and applies each operation as
it goes. The batch fails at index 3 with three changes already made, the client
gets a 422, and neither side knows what is true. Subtler, and the one the gate
is built around: validating every operation against the store *as it is now*, so
a batch with two deletes of the same id passes the check and then fails half way
through — the check has to walk the batch as if it were running.

**Model answer:** a first pass over a `Set` of live ids that mutates as it goes,
returning the first `{ index, reason }`; then a second pass that cannot fail,
because everything in it was already proved applicable.

## ex8 — the rule that makes it a service

**What it tested:** assembling the set, and one status code that only exists
because the *data* said no.

**The classic mistake:** answering the open-subtask refusal with a 400. Nothing
about the request was bad — the JSON was well formed, the field was valid, the
task existed. What refused it was the state of the resource, and that is
precisely what 409 means; a 400 tells the client to fix its request, which it
cannot. The other habit worth breaking: letting the unmatched-route 404 fall
through to express's HTML page, so the one path a confused client is most likely
to hit is the one that does not answer in your error format.

**Model answer:** one `sendProblem` helper used by every failure including the
final catch-all, a seed that is copied rather than borrowed, and the conflict
given a `type` URI of its own so a client can recognise it without reading
English.

## Further reading

- [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html) — the five members of ex3, and what `type` and `instance` are actually for.
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) — the definitions behind ex1: PUT versus PATCH, idempotency, and when 409 is the right refusal.
- [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status) — a fast reference for 201, 204, 409 and 422.
- [Express 5: `res.location()` and `res.status()`](https://expressjs.com/en/5x/api.html#res.location) — the response helpers these eight apps are built from.
- [MDN: `Idempotency-Key`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers) — the header in ex6, and the retry story it exists to make safe.
