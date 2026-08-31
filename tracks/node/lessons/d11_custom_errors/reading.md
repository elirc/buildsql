# Reading - node/d11_custom_errors

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **making a failure identifiable without reading its
message**. A custom error class exists so that a `catch` block can branch on
what happened rather than on an English sentence somebody will reword next
sprint — which means the identity has to survive everything the error goes
through: a `throw` and a `catch` (ex1), a subclass boundary (ex2), a JSON round
trip (ex3, ex4), being one of many (ex6), and even a realm boundary where
`instanceof` stops working entirely (ex7). Two lines do most of the work in this
set and are the two people forget: `this.name = ...` in the constructor, because
otherwise every log says `Error`; and passing the options object to `super`,
because otherwise `cause` is silently dropped and every chain in the system
stops at your class.

## ex1 — the two lines that make a class worth having

**What it tested:** that a subclass of `Error` is an ordinary class, and that
two of its four lines are not optional.

**The classic mistake:** omitting `this.name`. The class works, `instanceof`
works, and every log line, every `console.log`, every stack trace says `Error` —
so the one place the name would have helped is the one place it is missing.
Second: keeping the resource and id only inside the message, which forces every
handler to parse a sentence.

**Model answer:** `super` with the composed message, then `name`, then the two
fields — and `name` set before anything reads `.stack`, since the stack is
formatted from `name` and `message`.

## ex2 — narrowing in two directions

**What it tested:** a two-level hierarchy, so one middleware can catch
`HttpError` while a specific handler catches `ConflictError`. That is what a
class hierarchy buys you over a `status` field: you can be broad *or* precise at
the point of catching.

**The classic mistake:** `super(message)` without the options object. `cause` is
then never set, and every chain that passes through your error class loses
everything below it — a bug that only shows up when somebody tries to debug a
production incident through three layers of wrapping.

**Model answer:** `super(message, options)`, `this.name = new.target.name` so
each subclass names itself without repeating the line, and `expose` derived from
the status rather than passed in.

## ex3 — what you actually want in a log

**What it tested:** turning an error into something JSON-shaped, and the
judgement about what to leave out.

**The classic mistake:** building the object as one literal, so absent fields
become `code: undefined` keys. It survives `JSON.stringify` (which drops them)
and fails everything that inspects the object, which is why the gate checks
`Object.keys`. Second: including the stack, which is enormous, does not survive a
round trip usefully, and leaks absolute build paths.

**Model answer:** two required keys, conditional assignment for the rest with a
`typeof` check on each, recursion into an `Error` cause only, and a visited set —
because serialising is often the last thing a dying process does and a hang
there loses the whole report.

## ex4 — a registry is an allow list

**What it tested:** reconstructing a class from a name, and the security
instinct that goes with it.

**The classic mistake:** looking the name up with a bare `registry[json.name]`.
The payload came off a wire, so `"constructor"` and `"toString"` find things on
`Object.prototype` — `hasOwnProperty` is the fix. The far worse version, and one
you will see, is resolving the name against a global scope or an `eval`, which
lets a remote payload construct anything at all in your process.

**Model answer:** an own-property lookup into the registry, a plain `Error`
fallback, `name` reassigned unconditionally so the original survives even
without a class, and recursion for the cause.

## ex5 — a guard that lives with the class

**What it tested:** static helpers, TypeScript type guards
(`value is RetryableError`), and idempotent wrapping.

**The classic mistake:** `wrap` that always wraps. A retry loop typically wraps
whatever it caught before deciding whether to retry, so after five attempts the
error is five identical `cause` links deep and the useful root is buried. The
early return costs one line.

**Model answer:** `static is` returning `value is RetryableError` so callers get
narrowing for free, and `wrap` reusing `is` rather than repeating the
`instanceof` — one definition of what retryable means.

## ex6 — do not reinvent AggregateError

**What it tested:** that the platform already has a class for "several things
failed", and extending it keeps every tool that knows about it working.

**The classic mistake:** a custom class with a `failures` array and a message
built by joining four other messages together. Nothing recognises it, and the
message is unreadable at exactly the moment you need it. The argument order
catches people too: `AggregateError(errors, message)` is the reverse of `Error`.

**Model answer:** `super([...errors], summary)`, `name`, the operation kept as
data, and a `codes()` that de-duplicates and sorts so its output is stable enough
to use as an alert key.

## ex7 — when instanceof lies

**What it tested:** that `instanceof` compares prototype identity, and that
identity is per-realm. An error from a worker thread, a `vm` context or a
deserialised payload has a different `Error` constructor entirely, so
`instanceof` says no about something that is, for every practical purpose, that
error.

**The classic mistake:** checking one field. `value.name === "NotFoundError"`
alone makes every config object with a `name` an error. And `typeof value ===
"object"` alone lets `null` through to a property read.

**Model answer:** one shared structural predicate — object, not null, string
`name`, string `message` — used by both the function and the
`Symbol.hasInstance` static, which is the hook `instanceof` consults on its
right-hand side.

## ex8 — every problem, in one round trip

**What it tested:** collecting rather than short-circuiting, and the `toJSON`
that error classes almost always need and almost never have.

**The classic mistake:** returning on the first failure. The user fixes one
field, resubmits, and is told about the next one — four times. The other, and it
is the one that surprises people: `JSON.stringify(someError)` returns `{}`.
`message`, `name` and `stack` are all non-enumerable, so the default serialiser
finds nothing and the entire report vanishes on the way to the client.

**Model answer:** two loops with no `break`, issues stored as a copy, and a
`toJSON` that names exactly what crosses the wire — which is also the place to
decide that the stack does not.

## Further reading

- [MDN: `Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) — the constructor, `cause`, and the non-enumerable properties behind ex8's `toJSON`.
- [MDN: `AggregateError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError) — the base class ex6 extends, including the argument order.
- [MDN: `Symbol.hasInstance`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance) — how ex7 changes what `instanceof` means.
- [MDN: `JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) — the `toJSON` protocol ex8 relies on.
- [Node.js: Errors](https://nodejs.org/api/errors.html) — the platform's own error classes, the `code` convention, and `Error.captureStackTrace`.
