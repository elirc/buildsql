## Hint 1

You need a matcher and a ranker again. Write them, or lift your own from ex2 and
ex3 — the point of this problem is the dispatch loop around them, not a third
copy of the parsing.

Keep the route list sorted by specificity as routes are registered, and the
request path becomes a walk down that list taking the first match.

## Hint 2

There are three answers when no handler matched, and telling them apart is what
makes the router usable:

- no route matches this **path**, whatever the method → 404
- some route matches the path, and the method is `OPTIONS` → 204 with `Allow`
- some route matches the path, and the method is anything else → 405 with the
  same `Allow`

So collect the matching routes' methods once and reuse the set for both. `HEAD`
belongs in `Allow` whenever `GET` does, and `OPTIONS` always does — but neither
is a method anyone registers.

## Hint 3

`http.createServer` hands you a synchronous listener, and your handlers are
async. Start an async function inside it and put a `try`/`catch` around the
whole dispatch, or a rejected handler becomes an unhandled rejection: the client
gets nothing at all and waits for its own timeout, which is a much worse failure
than a 500.

`await` the handler even though its return type allows `void` — awaiting a
non-promise is free, and not awaiting a promise is the bug.

One decision the gate leaves you: what to do when a handler throws **after** it
has already written part of the response. `res.headersSent` is how you find out;
what to do about it is a judgement call, and the honest options are all
unattractive.
