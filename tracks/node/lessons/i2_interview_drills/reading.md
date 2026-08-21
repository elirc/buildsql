# Reading - node/i2_interview_drills

What the interviewer was listening for in each drill, and the follow-ups that
come after the code compiles.

## Notes

**Drills are graded on narration, not only on output.** In a real interview
the code is confirmation of a plan you already said out loud. Two sentences
before you type — "I will start N workers over a shared cursor and store
results by index, so the order is the input order and a slot refills as soon
as one finishes" — is worth more than the same code produced in silence,
because it shows the interviewer how you think when a problem is harder than
this one.

**Time-boxes are diagnostic.** If a drill takes twice its box, the gap is
almost never typing speed; it is a decision you had not already made — which
data structure, which combinator, where the state lives. Redo the drill a week
later and watch the box shrink, which is exactly what the review ladder is
for.

**Say the trade-off.** Every one of these has one: fail-fast versus collect,
fixed window versus token bucket, chunk versus pool, `then(a, b)` versus
`then(a).catch(b)`. Naming it unprompted is the single strongest signal a
candidate can send in a coding round.

## ex1 — Promise.allSettled

The specification is the answer: one record per input, input order, never
rejects. The elegant implementation follows from the third clause — if every
input is mapped to a promise that *cannot* reject, `Promise.all` has nothing
to fail on and gives you the ordering for free.

The detail worth defending is two-argument `then` rather than
`.then(...).catch(...)`. The chained form also catches an error thrown by your
own success handler, which would produce a "rejected" record for a promise
that actually fulfilled. It is a small difference and interviewers who know it
are pleased when you do.

The alternative implementation — a results array, a completion counter, and a
manual `resolve` when the counter reaches the input length — is worth
mentioning because it is what you would write if `Promise.all` were also off
the table, and because it makes the ordering guarantee explicit rather than
inherited.

Two follow-ups to have ready. "How does this differ from `Promise.all`?"
Fail-fast versus report-everything, and the shape of the result. "When would
you use it?" When the operations are independent and partial success is a real
outcome — sending five notifications, warming three caches — as opposed to
"render this page", where one failure means the whole thing failed.

## ex2 — the concurrency limiter

The pool-versus-chunk distinction is the entire point of this drill, and the
gate is built to expose it: it releases exactly one worker and checks that a
new item started. Chunking stalls there, because a chunk is not done until its
slowest member is.

The shared cursor is the other thing to narrate. `const index = next; next +=
1;` before any `await` means two runners cannot claim the same index — and the
reason is that JavaScript is single-threaded, so nothing can interleave
between those two statements. The same code in Java or Go would need an atomic
increment. Saying that shows you know *why* it is safe rather than that it
happens to work.

Fail-fast is the part candidates most often leave out. `Promise.all` rejecting
does not stop the other runners: they are inside their own `while` loops and
will keep pulling items until the list is exhausted, firing requests at a
service that is already failing. A shared flag checked in the loop condition
is the fix, and "should it fail fast at all, or collect the failures like
`allSettled`?" is a genuine design question worth raising before you pick.

Production note to close with: this is `p-limit` / `p-map`, and in real code
you would use one — plus an `AbortSignal` so the pool can be cancelled, which
the drill deliberately leaves out.

## ex3 — the prediction battery

Three snippets in fifteen minutes tests whether the model is *automatic*. If
you have to re-derive the rules each time, an interviewer sees hesitation
where they want fluency.

Snippet 1 is the base case and should take fifteen seconds: two synchronous
lines, then the nextTick queue, then microtasks.

Snippet 2 is about async functions being scheduling constructs. The body runs
synchronously to the first `await`, so `"1"` is in the synchronous group; the
continuation is queued at that moment, which is *before* the `.then` on the
next line is registered, so `"2"` precedes `"3"`. Candidates who think of
`async` as "runs in the background" get this backwards.

Snippet 3 is the one that separates. A microtask queues a nextTick and a
nextTick queues a microtask, so both queues refill during the drain. The order
that falls out — tick, then both microtasks, then the refilled tick, then the
timer — is only predictable if you hold the checkpoint as a *loop* over two
queues rather than two steps.

The meta-skill: narrate in passes. "Synchronous pass gives me these. Then the
tick queue, which gains one while draining. Then microtasks, which gain one.
Then back to ticks. Then timers." That is a method an interviewer can follow,
and it survives a snippet you have never seen.

## ex4 — the token bucket

Rate limiting has two classic answers and the difference is worth having at
your fingertips. A **fixed window** counts requests per interval and resets on
a boundary — simple, and it allows double the intended rate across a boundary.
A **token bucket** refills continuously; the fill rate is the sustained rate
and the capacity is the burst you are willing to allow. Sliding-window
counters sit in between.

The refill being arithmetic rather than a timer is the implementation insight:
you do not need a `setInterval` topping up buckets for every client (which
would be a memory and CPU leak with many keys) — you compute what *would* have
accumulated since the last time you looked. That is why the whole thing is a
handful of lines and why it scales to a million keys in Redis.

The cap is what the gate checks after sixty idle seconds, and it is the bug
worth naming: without `Math.min`, an idle client accrues unlimited tokens and
your rate limiter becomes a rate suggestion.

Two follow-ups. "Where does the state live in production?" Redis, because two
instances behind a load balancer otherwise keep two independent counters —
and the increment has to be atomic, which is why real implementations use a
Lua script. "What do you send back?" 429 with `Retry-After`, plus
`X-RateLimit-*` headers, because a client that can see its budget is a client
that will not spend the whole thing.

## ex5 — promisify and callbackify

The pair tests whether you understand the two conventions well enough to move
between them, and the async-callback rule is the sharp edge.

`callbackify` must not call back synchronously. Using `.then()` gives you that
guarantee for free: promise handlers always run in a microtask, never in the
same turn. Writing the wrapper as an `async` function and awaiting inside it
looks equivalent and is worse — it returns a promise nobody is holding, so a
throw inside your own callback becomes an unhandled rejection.

The error-first conversion is the other detail. Anything at all can be thrown
in JavaScript, so a defensive `error instanceof Error ? error : new
Error(String(error))` is what a careful implementation does, and saying so is
free credit.

Follow-ups worth pre-empting: "what does `util.promisify` add?" —
multi-argument support and the `util.promisify.custom` symbol, which lets a
library supply a better promise version (that is how `timers/promises` works).
"Why does `callbackify` exist at all?" — for handing modern code to an old API
that expects a callback, which is more common in an aging codebase than you
would like.

## ex6 — redacting across chunk boundaries

The problem statement contains its own answer once you see it: a match can
straddle a boundary, so any character within `secret.length - 1` of the end of
what you have might be the start of a match, and cannot be emitted yet. Hold
those back, emit the rest, and let `flush` deal with whatever is left.

Two things the gate forces that a naive version gets wrong. The final
occurrence, ending exactly at the end of the input, only gets replaced if
`flush` runs the replacement again on the held-back tail. And `StringDecoder`
rather than `chunk.toString()`, because a multi-byte character split across
chunks would be corrupted before you even looked for the secret — the same
lesson as 06 ex2, in a place where it is easy to forget.

`split(secret).join(replacement)` is worth a sentence too: it replaces every
occurrence without a regular expression, which matters because a secret can
contain regex metacharacters. `String.prototype.replaceAll` is the modern
equivalent.

The honest caveat, and a good thing to volunteer: this works because the
secret is a fixed-length literal. Redacting a *pattern* — card numbers, JWTs —
has no fixed lookbehind, so you need a bounded buffer and a decision about the
longest match you will support. Naming that limit is what a security-minded
engineer does.

## challenge — the take-home

Three features in forty-five minutes, and the grading is as much about
sequencing as about code: get pagination working, then caching, then the
create endpoint, running the gate between each. A take-home that does two
things properly beats one that does three things approximately.

The ETag is where the time goes, and the trick is to serialise once:

```ts
const body = JSON.stringify(payload);
const etag = hash(body);
res.send(body);          // the same string you hashed
```

Computing the ETag from the data and then letting `res.json()` serialise
independently is how you get an ETag that does not match its own body. Note
also that express sets a weak ETag of its own on `res.json` — sending the
string yourself keeps you in control.

Why this is worth practising: conditional requests are the cheapest
optimisation in HTTP and almost nobody implements them on their own APIs. A
candidate who reaches for `If-None-Match` unprompted is signalling that they
have thought about bandwidth and about what a mobile client actually costs.

The "what would you do with another hour" question always comes. A good list:
cursor pagination instead of offsets (stable under concurrent inserts),
filtering by tag, `Cache-Control: max-age` for real caching rather than pure
revalidation, and an OpenAPI description so the client can be generated.

## review1 — the wildcard bus

Everything from the lesson-04 challenge — registration order, copy before
dispatch, the `once` wrapper that `off` has to find — plus two additions that
change the shape slightly.

The wildcard pass is a second loop with a different argument list. That
asymmetry is the design decision: a `"*"` listener has to know *which* event
fired, so it gets the name first. Every real wildcard bus does something like
this, and the fact that the argument lists differ between the two kinds of
listener is exactly why wildcards make a bus harder to type and harder to
reason about.

`emit` returning a count rather than a boolean is a small improvement over the
built-in and makes tests precise. In production the more useful version logs
or meters unhandled events, because "an event nobody listened to" is usually a
wiring bug.

The trade-off to say out loud: wildcards are convenient for logging, tracing
and audit, and they make it impossible to answer "who reacts to this event?"
by searching the codebase. Most large systems keep them for cross-cutting
concerns only, and namespace their events (`order.created`, `order.shipped`)
so a prefix match can stand in for a true wildcard.

## Further reading

- [MDN: `Promise.allSettled()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled) — the semantics drill 1 reimplements.
- [`util.promisify()` and `util.callbackify()`](https://nodejs.org/api/util.html#utilcallbackifyoriginal) — including the custom symbol and the async guarantee.
- [Node.js: implementing a Transform stream](https://nodejs.org/api/stream.html#implementing-a-transform-stream) — `_transform`, `_flush` and the object-mode options behind drill 6.
- [MDN: HTTP conditional requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Conditional_requests) — ETags and `If-None-Match`, for the challenge.
- [MDN: 429 and `Retry-After`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After) — what a well-behaved limiter tells its clients.
