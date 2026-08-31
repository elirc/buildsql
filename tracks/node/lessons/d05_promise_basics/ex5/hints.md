## Hint 1

There is no `promise.state` — deliberately, because reading it would tempt
people into polling. The only way to observe a promise is to attach a handler,
and the only way to observe *absence* is to race it against something you know
will settle.

So: build a promise that reports the outcome, build a second one that reports
"pending", and race them.

## Hint 2

The "pending" marker must settle **after** an already-settled promise would have
delivered, and **before** a genuinely pending one could. One microtask hop is
exactly that window: `Promise.resolve().then(...)`.

Order matters. Attach the handlers to the input promise *first*, so on a settled
promise its microtask is queued ahead of the marker's.

## Hint 3

Both handlers on the input have to be attached in the same `.then(onOk, onErr)`
call rather than as a `.then().catch()` chain — otherwise the catch sits one hop
further down and loses the race with the marker.

That same attachment is also what stops a rejected input becoming an unhandled
rejection just because somebody inspected it. Whether that is a feature or a
footgun is worth an opinion: `inspect` quietly marks the rejection as handled,
which is convenient in a test and hides a real problem in production code.
