# Reading - node/04_events_errors

Emitters are the oldest abstraction in Node and still the one everything is
built on. Error handling is the topic that separates a service that survives
a bad night from one that does not.

## Notes

**The observer pattern, with one name.** `EventEmitter` is a `Map` from event
name to an array of functions, plus `emit`, and knowing that it is that small
demystifies it. It has no queue, no scheduling, no priorities and no
back-pressure: `emit` calls the listeners and returns. Everything that feels
magical about streams and servers is built on this plus a state machine.

**Synchronous dispatch has consequences.** Because `emit` runs listeners
immediately, a listener that throws propagates out of the `emit` call — into
whatever code was emitting, which is often deep inside Node itself. Because it
is synchronous, a slow listener delays the emitter and everything behind it.
And because it is synchronous, adding a listener *after* the event was emitted
means you missed it forever: there is no replay. That last one bites people
who register a listener in a promise continuation and wonder why nothing
fires.

**`"error"` is special, and only `"error"`.** `emit("error", err)` with no
listener throws the error. Every other event name with no listener is a no-op.
This is why `stream.on("error", ...)` is not optional, why `pipeline()` (next
lesson) is better than `.pipe()` — it wires the error handling for you — and
why a well-behaved emitter documents whether it can emit `"error"` at all.

**Unhandled rejections kill the process, since Node 15.** The default for
`--unhandled-rejections` is `throw`, which raises an uncaught exception if
nothing handles a rejected promise. This was controversial and is right: a
rejection nobody looked at is an error nobody looked at. You can register
`process.on("unhandledRejection", handler)` to log before exiting, but you
should still exit — the state that produced it is unknown.

**`uncaughtException` is not a recovery mechanism.** The handler exists so you
can log, flush metrics, and stop accepting new connections before exiting.
Continuing after one means running a process whose invariants have been
violated by definition. The production pattern is: log, close the server, give
in-flight requests a couple of seconds, `process.exit(1)`, and let systemd,
Kubernetes or PM2 start a fresh one.

**Graceful shutdown belongs in the same mental compartment.** `SIGTERM` is
what an orchestrator sends before it kills you; the polite response is to stop
listening, finish in-flight work, close the pool, and exit. In code that is
`process.on("SIGTERM", () => server.close(...))`, and it is a routine
interview question because a service that drops requests on every deploy is a
service nobody trusts.

## ex1 — an emitter of your own

Subclassing `EventEmitter` is the standard way to expose "things happened" on
your own objects, and the exercise's shape — a method that mutates state and
then announces it — is the shape you will write dozens of times.

Two design notes hide in it. First, `emit` after the state change, never
before: listeners run synchronously and will read the state you just mutated,
so emitting first shows them the old world. Second, `flush` hands out its
internal array and immediately replaces it. Handing out a live reference to
internal state is a bug you only notice later, when a caller mutates it and
the queue mutates with it — the same reasoning behind returning copies from
getters in every language.

The interview version is "when would you use an EventEmitter instead of a
promise, or a callback?" The answer: when the number of occurrences is not one
— zero, many, or unknown — and when multiple independent parts of the program
want to know. And the follow-up worth pre-empting: emitters make control flow
hard to follow, so prefer a promise when the answer really is "one result".

## ex2 — the convention, and Zalgo

Error-first callbacks are a convention, not a type, so the compiler cannot
help you keep them. Three rules make a callback API well behaved: call the
callback exactly once, pass an `Error` (never a string) as the first argument
on failure, and always call it asynchronously.

The third one has a name — "don't release Zalgo", from an essay by Isaac
Schlueter — and the reason is the interesting part. Consider an API that
validates its input synchronously and calls back with an error, but does I/O
and calls back asynchronously on success. Now the caller's code after the call
sometimes runs before the callback and sometimes after. Any state they set up
on the line below is present in one case and missing in the other, so the bug
appears only on the error path, only for some inputs, and never in the tests.
Deferring unconditionally — `process.nextTick(() => cb(err))` — removes the
whole category.

Codes rather than messages is the other durable lesson. Node's own errors do
this: `ENOENT`, `EACCES`, `ERR_MODULE_NOT_FOUND`. Message text is for humans
and changes between versions; `error.code` is API, and branching on it is the
supported way to tell "the file was not there" from "you may not read it".

## ex3 — the taxonomy that decides whether to crash

The operational/programmer split is the single most useful idea in Node error
handling, and the reason to care is concurrency: one process is serving many
requests, so "keep going after an unknown failure" means "keep serving nine
hundred other people from a process whose state is a mystery".

In practice a service has a small number of operational error classes —
`ValidationError`, `NotFoundError`, `ConflictError`, `UpstreamError` — each
carrying a `status`, and a single error-handling middleware that maps them to
responses (you will build exactly that in lesson 10). Everything else falls
through to a 500 and a log entry with the stack, and if it happens often
enough to matter it becomes a bug ticket, not a new `catch`.

Three implementation details worth carrying:

- **Set `name`.** It is what `console.log(err)`, `err.toString()` and most
  loggers print. A class called `ValidationError` whose `name` is still
  `"Error"` is invisible in production logs.
- **`instanceof` works** for real ES2015 classes. It broke when TypeScript
  targeted ES5 (the compiled constructor could not properly subclass the
  built-in), which is why old codebases have `Object.setPrototypeOf(this,
  new.target.prototype)` in error constructors. Modern targets do not need it.
- **Never throw a non-Error.** `throw "nope"` gives you no stack trace, and
  every `catch` in the codebase now has to handle two shapes. TypeScript's
  `useUnknownInCatchVariables` (on in this course) exists to remind you that
  the thing you caught could be anything.

## ex4 — bridging events into a promise

This is the pattern for "wait for one outcome from a thing that emits many",
and the reason it is an exercise rather than a one-liner is the cleanup.

Node ships `events.once(emitter, name)`, which does most of this for you and
supports an `AbortSignal`, and in real code you should use it. Writing it by
hand once teaches the two things using it cannot: that `off` matches by
function identity, so inline arrows are unremovable, and that both settlement
paths need cleanup — the error path is the one people forget, because it is
tested last if at all.

The leak this prevents is worth picturing concretely. A long-lived emitter (a
connection pool, a message bus, a `process`) plus a listener added per request
equals an array that grows for the lifetime of the process, each entry holding
a closure, each closure holding whatever it captured. Memory climbs slowly,
the heap snapshot shows thousands of closures, and the fix is one `off` call.
Node's `MaxListenersExceededWarning` at eleven listeners is a smoke alarm for
exactly this.

## challenge — the thing itself

Writing `EventEmitter` is a favourite interview task because it is small
enough for 30 minutes and has four separate places to be subtly wrong.

The copy-before-dispatch rule is the deepest of them. Mutating a collection
while iterating it is a classic bug in every language; here it shows up as "my
second listener silently stopped running", because removing element 0 while
the loop is at index 0 shifts element 1 down into the slot the loop has
already passed. Node's real implementation calls `arrayClone` for exactly this
reason.

The `once` wrapper is the other one. Because you register a wrapper rather than
the caller's function, `off(event, original)` has to find the wrapper — the
real `EventEmitter` does it by hanging a `listener` property on the wrapper and
searching for either. A `Map` from original to wrapper is simpler and has one
caveat worth knowing: registering the same function with `once` twice on
different events collides, which is why the real implementation stores the
back-reference on the wrapper instead. Worth mentioning out loud if you are
ever asked this in an interview: naming a limitation of your own design is a
strong signal.

## review1 — a chain you can follow

`Error.cause` (ES2022) standardised something every codebase had invented
badly. The value is that context accumulates *without* losing the original:
`"rendering the dashboard: loading the user profile: ECONNREFUSED"` tells you
what was being attempted and what actually broke, and `rootCause` gets you the
error with the useful stack.

The alternative people reach for — catching, logging, and rethrowing a new
error — produces two log entries for one failure and throws away the original
stack. The alternative people reach for second — letting the raw
`ECONNREFUSED` propagate — tells the reader what happened and nothing about
why anyone cared.

The type detail in `rootCause` is worth noticing: `cause` is `unknown`,
because `{ cause: "anything" }` is legal. So the loop condition has to be
`instanceof Error`, which both narrows the type for TypeScript and stops you
returning a string from a function that promises an `Error`. That is the
`unknown` vs `any` distinction doing real work — the TypeScript track's
`10_guards_assertions` is the long version.

## Further reading

- [`events` — Node.js API docs](https://nodejs.org/api/events.html) — the whole emitter surface, including the `"error"` rule and `events.once`.
- [Error handling in Node.js](https://nodejs.org/en/learn/error-handling/error-handling-in-nodejs) — the official take on operational vs programmer errors.
- [`Error` — Node.js API docs](https://nodejs.org/api/errors.html) — `error.code`, the system-error properties, and the class hierarchy.
- [MDN: `Error` cause](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause) — the standard chaining property from review1.
- [MDN: `Error` subclassing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) — including the ES5 transpilation caveat that produced all those `setPrototypeOf` lines.
