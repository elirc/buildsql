# 04 — Events, and what to do when things break

Node has two ways to say "something happened later". You have spent a lesson
on the first one: a promise, which settles exactly once, with a value or an
error. The second is the `EventEmitter`, which says "something happened"
however many times it likes, to however many listeners are interested, and
never settles at all. HTTP servers, sockets, streams, processes, file watchers
— every long-lived thing in Node is an emitter, so this is not an optional
corner of the platform.

The two models are not competitors; they answer different questions. *Did the
database call succeed?* is a promise: one question, one answer. *What is
arriving on this socket?* is an emitter: an open-ended stream of occurrences,
where "done" is itself just another event. Most real code needs to bridge
them, which is exercise 4.

The other half of this lesson is errors, because in Node the two subjects are
the same subject. A rejected promise nobody handles will, since Node 15,
terminate your process. An `"error"` event nobody listens for **throws** — it
is the one event name with special behaviour, and an unhandled one takes the
process down too. And the decision of whether taking the process down is
*correct* turns out to be one of the sharpest lines in server engineering: the
difference between an operational error and a programmer error.

## Concept — emitters, and the error taxonomy

An emitter is a registry of callbacks keyed by name:

```ts
import { EventEmitter } from "node:events";

const jobs = new EventEmitter();

jobs.on("added", (job, size) => console.log(`${job} queued, ${size} waiting`));
jobs.once("ready", () => console.log("this fires at most once"));

jobs.emit("added", "resize-image", 1);   // calls every "added" listener, now
```

Four facts about `emit` that decide most of the behaviour you will meet:

1. **It is synchronous.** `emit` calls the listeners in registration order and
   returns when the last one has returned. There is no queue and no `await`.
   That is why a slow listener slows down the emitter, and why a listener that
   throws propagates out of the `emit` call.
2. **Order is registration order**, always, and there is no priority system.
3. **`emit` returns a boolean** — `true` if there was at least one listener.
   That is how you can tell an event nobody heard.
4. **Listeners are not removed for you**, except by `once`. An emitter that
   lives for the process lifetime with listeners added per request is a memory
   leak, and Node warns you about it at eleven listeners for one event
   (`MaxListenersExceededWarning`) precisely because that number usually means
   a bug rather than a design.

Then the special case:

```ts
const socket = new EventEmitter();
socket.emit("error", new Error("connection reset"));   // THROWS. No listener.
```

`"error"` is the one name `EventEmitter` treats specially: emitting it with no
listener registered throws the error rather than dropping it. This is
deliberate — a silently ignored error is worse than a crash — and it is why
every stream, socket and server you use needs an error listener.

### Operational vs programmer errors

The distinction comes from Joyent's old Node error-handling guide and it has
outlived nearly everything else from that era:

- An **operational error** is a correct program meeting a wrong world: bad
  user input, a 500 from an upstream service, a connection reset, a missing
  file, a full disk. Your code did nothing wrong. These are *expected*, they
  belong in your control flow, and you handle them — retry, return a 400, log
  and continue.
- A **programmer error** is a bug: reading a property of `undefined`, calling
  a function that does not exist, passing the wrong type. Nothing sensible can
  be done at run time, because the process is now in a state its author never
  intended. The honest response is to crash, let a supervisor restart you, and
  fix the bug.

The reason this matters more in Node than in some other runtimes is that one
process serves many concurrent requests. A `try`/`catch` that swallows a
programmer error keeps a process alive with corrupted state, and it will keep
serving the other nine hundred requests with it.

### Errors are objects you get to design

`throw new Error("bad email")` gives the caller a string to regex. A custom
class gives them something to branch on:

```ts
class NotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`no such order: ${id}`);
    this.name = "NotFoundError";      // without this, logs say "Error"
  }
}
```

`instanceof NotFoundError` in a `catch`, `error.id` for the details,
`error.name` in the log. And since ES2022 there is a standard way to keep the
error underneath:

```ts
throw new Error("loading the user profile failed", { cause: originalError });
```

Everything — `console.log`, vitest, most loggers — knows how to print a
`cause` chain, which is why this beats inventing `error.inner`.

## Exercise 1 — an emitter of your own

Edit `ex1/solution.ts`. Implement `JobQueue`, a class that extends
`EventEmitter`:

- `add(job)` records the job, emits `"added"` with **two** arguments — the
  job and the queue's new size — and returns the new size.
- `flush()` emits `"drained"` with **one** argument, the array of jobs, then
  empties the queue and returns that array. Flushing an empty queue still
  emits, with an empty array.
- `size()` returns how many jobs are waiting.

The gate checks that the listener has already run by the time `add` returns
(emit is synchronous), that a `once` listener fires only once, and that
listeners are called in registration order.

```
uv run dojo test node 04_events_errors ex1
```

## Exercise 2 — the callback convention, from the other side

Edit `ex2/solution.ts`. Implement `parseConfig(text, callback)`:

- if `text` is not valid JSON, call back with an `Error` whose `code` is
  `"EPARSE"`;
- if it parses but has no numeric `port`, call back with an `Error` whose
  `code` is `"EMISSING"` and whose message mentions `port`;
- otherwise, call back with `(null, config)`.

And one rule that is not about the error at all: **the callback must never be
called synchronously.** Defer it — `process.nextTick` or `queueMicrotask` —
so that `parseConfig` always returns before the callback runs.

That rule has a name (Isaac Schlueter's "don't release Zalgo") and a real
reason. An API that calls back synchronously *sometimes* — say, when the input
is invalid — runs your callback before the caller has finished setting up,
which produces bugs that appear only on the error path and only under some
inputs. Pick one behaviour and always do it; asynchronous is the one that is
always safe.

```
uv run dojo test node 04_events_errors ex2
```

## Exercise 3 — an error class, and a judgement call

Edit `ex3/solution.ts`. Two things.

First, `ValidationError`, which extends `Error` and carries:
`name` of `"ValidationError"`, the `message` it was constructed with, the
`field` that failed, `status` of `400`, and `isOperational` of `true`.

Second, `classifyError(error)`, returning `"operational"` or `"programmer"`,
by this rule:

1. anything that is not an `Error` instance → `"programmer"` (someone threw a
   string, which is a bug on its own);
2. an error with `isOperational === true` → `"operational"`;
3. everything else → `"programmer"`.

Rule 3 is the interesting one, and it is a deliberate design choice: errors
are guilty until proven innocent. An unrecognised failure gets treated as a
bug, because assuming a mystery is harmless is how a corrupted process stays
up. Real systems mark their operational errors on purpose — which is exactly
what `isOperational` is doing on your `ValidationError`.

```
uv run dojo test node 04_events_errors ex3
```

## Exercise 4 — one promise from many events

Edit `ex4/solution.ts`. Implement `collectUntilEnd(source)`, which watches an
emitter and returns a promise that:

- resolves with an array of every `"data"` payload, in order, when `"end"`
  fires;
- rejects with the error if `"error"` fires first;
- **and removes every listener it added, on both paths.**

The gate checks the listener counts after the promise settles, because that is
the bug this exercise exists to prevent. Attaching listeners to a long-lived
emitter and never removing them is *the* Node memory leak: the emitter holds
your closure, your closure holds the array, the array holds the payloads, and
nothing is ever collected.

One thing to know before you start: `off` (and its older alias
`removeListener`) removes a listener **by identity**. Passing a fresh arrow
function with the same body removes nothing at all.

```
uv run dojo test node 04_events_errors ex4
```

## Challenge — write EventEmitter yourself

Edit `challenge/solution.ts`. Implement `createEmitter()` returning an object
with `on`, `once`, `off` and `emit`, obeying four rules:

1. listeners run in registration order, synchronously;
2. `emit` returns `true` if at least one listener ran, `false` otherwise;
3. `off` removes exactly the listener it is given — including a listener
   registered with `once`, which is not the function you actually stored;
4. a listener that removes itself (or any other listener) *during* dispatch
   must not disturb the dispatch in progress.

Rule 4 is the one that separates a working implementation from a nearly
working one, and it is why the real `EventEmitter` copies its listener array
before walking it. Rule 3 is the other trap: `once` has to wrap the caller's
function, so `off` needs a way back from the original to the wrapper.

Honest difficulty note: `on`/`emit`/`off` is fifteen minutes. `once` plus
rule 4 is another twenty, and this exact question ("implement EventEmitter")
is a standard mid-level interview task.

```
uv run dojo test node 04_events_errors challenge
```

## Review

`review1/solution.ts` comes back on the spaced-review schedule. Implement:

- `wrapError(error, context)` → a new `Error` whose message is
  `` `${context}: ${error.message}` `` and whose `cause` is the original error;
- `rootCause(error)` → walk the `cause` chain and return the error at the
  bottom of it. An error with no cause is its own root cause.

```
uv run dojo test node 04_events_errors review1
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
import { EventEmitter } from "node:events";
import { describe, expect, test } from "vitest";

import { JobQueue } from "./ex1/solution";
import { parseConfig } from "./ex2/solution";
import { ValidationError, classifyError } from "./ex3/solution";
import { collectUntilEnd } from "./ex4/solution";
import { createEmitter } from "./challenge/solution";
import { rootCause, wrapError } from "./review1/solution";

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe("04_events_errors", () => {
  test("ex1 - JobQueue is an EventEmitter that announces what it did", () => {
    const queue = new JobQueue();
    expect(
      queue instanceof EventEmitter,
      "JobQueue must extend EventEmitter, so every listener API comes for free",
    ).toBe(true);

    const added: Array<[string, number]> = [];
    queue.on("added", (job: string, size: number) => added.push([job, size]));

    const size = queue.add("resize-image");
    expect(
      added,
      "emit() is SYNCHRONOUS: by the time add() returns, the listener has " +
        "already run, with the job and the new size as its two arguments",
    ).toEqual([["resize-image", 1]]);
    expect(size, "add() also returns the new size").toBe(1);

    let onceCount = 0;
    queue.once("added", () => {
      onceCount += 1;
    });
    queue.add("send-email");
    queue.add("rebuild-index");
    expect(
      onceCount,
      "a listener registered with once() is removed after its first call - " +
        "two more adds must not call it twice",
    ).toBe(1);
    expect(
      added.map(([job]) => job),
      "listeners are called in registration order, every time",
    ).toEqual(["resize-image", "send-email", "rebuild-index"]);

    const drained: string[][] = [];
    queue.on("drained", (jobs: string[]) => drained.push(jobs));
    const flushed = queue.flush();
    expect(
      flushed,
      "flush() returns the jobs it drained, in the order they were added",
    ).toEqual(["resize-image", "send-email", "rebuild-index"]);
    expect(
      drained,
      'flush() also emits "drained" with that same list',
    ).toEqual([["resize-image", "send-email", "rebuild-index"]]);
    expect(queue.size(), "the queue is empty after a flush").toBe(0);

    queue.flush();
    expect(
      drained[1],
      "flushing an empty queue still emits, with an empty list - a quiet " +
        "special case is a bug waiting to be reported as flakiness",
    ).toEqual([]);
  });

  test("ex2 - parseConfig() follows the error-first convention, asynchronously", async () => {
    const calls: Array<[Error | null, unknown]> = [];
    parseConfig('{"port": 8080}', (error, config) => calls.push([error, config]));
    expect(
      calls.length,
      "the callback must NOT have run yet. A function that is sometimes " +
        "synchronous and sometimes not is the hardest kind of bug to find - " +
        "defer with process.nextTick or queueMicrotask (README ex2)",
    ).toBe(0);

    await settle();
    expect(calls.length, "...and it must have run exactly once by now").toBe(1);
    expect(calls[0][0], "success passes null as the first argument").toBe(null);
    expect(
      calls[0][1],
      "the parsed object is the second argument",
    ).toEqual({ port: 8080 });

    const broken: Array<Error | null> = [];
    parseConfig("{not json", (error) => broken.push(error));
    await settle();
    expect(broken.length, "one call, whatever happens").toBe(1);
    expect(
      broken[0],
      "a parse failure is reported through the callback, never thrown - the " +
        "caller has no try/catch that could reach you",
    ).toBeInstanceOf(Error);
    expect(
      (broken[0] as Error & { code?: string }).code,
      'tag the parse failure with code "EPARSE" so callers can branch on the ' +
        "kind of failure instead of on the message text",
    ).toBe("EPARSE");

    const missing: Array<Error | null> = [];
    parseConfig('{"host": "localhost"}', (error) => missing.push(error));
    await settle();
    expect(
      (missing[0] as Error & { code?: string }).code,
      'valid JSON without a "port" is a different failure: code "EMISSING"',
    ).toBe("EMISSING");
    expect(
      missing[0]?.message,
      "the message names the missing field so a human can act on it",
    ).toContain("port");
  });

  test("ex3 - errors carry their own identity, and you can classify them", () => {
    const error = new ValidationError("email", "must contain an @");

    expect(error instanceof Error, "a custom error IS an Error").toBe(true);
    expect(
      error instanceof ValidationError,
      "...and it is also its own class, which is what lets a catch block tell " +
        "one failure from another",
    ).toBe(true);
    expect(
      error.name,
      'name must be "ValidationError", not the inherited "Error" - it is what ' +
        "logs and stack traces print",
    ).toBe("ValidationError");
    expect(error.message, "the message is the second constructor argument").toBe(
      "must contain an @",
    );
    expect(error.field, "the field that failed, kept as data").toBe("email");
    expect(error.status, "a validation failure maps to HTTP 400").toBe(400);
    expect(
      typeof error.stack,
      "extending Error keeps the stack trace - this is why you subclass Error " +
        "instead of throwing a plain object",
    ).toBe("string");

    expect(
      classifyError(error),
      "a ValidationError is expected: bad input from outside. That is an " +
        "OPERATIONAL error - handle it and carry on",
    ).toBe("operational");
    expect(
      classifyError(new TypeError("cannot read properties of undefined")),
      "a TypeError is a bug in your own code: a PROGRAMMER error. The process " +
        "cannot know what state it is in, so it should not pretend otherwise",
    ).toBe("programmer");
    expect(
      classifyError(Object.assign(new Error("upstream 503"), { isOperational: true })),
      "any error explicitly marked isOperational counts as operational, " +
        "whatever class it is",
    ).toBe("operational");
    expect(
      classifyError("something went wrong"),
      "a thrown string is not an Error at all - treat it as a programmer error",
    ).toBe("programmer");
  });

  test("ex4 - collectUntilEnd() cleans up the listeners it added", async () => {
    const source = new EventEmitter();
    const collected = collectUntilEnd<string>(source);
    collected.catch(() => {});

    source.emit("data", "alpha");
    source.emit("data", "beta");
    source.emit("end");

    expect(
      await collected,
      'every "data" payload received before "end", in order',
    ).toEqual(["alpha", "beta"]);
    expect(
      source.listenerCount("data") +
        source.listenerCount("end") +
        source.listenerCount("error"),
      "after settling, remove every listener you added. Listeners that " +
        "outlive their promise are the classic Node memory leak, and at 11 of " +
        "them Node starts printing MaxListenersExceededWarning",
    ).toBe(0);

    const failing = new EventEmitter();
    const doomed = collectUntilEnd<string>(failing);
    doomed.catch(() => {});
    failing.emit("data", "alpha");
    failing.emit("error", new Error("socket hang up"));

    await expect(
      doomed,
      'an "error" event must reject the promise with that error. An emitter ' +
        "with no error listener at all throws instead, which kills the process",
    ).rejects.toThrow("socket hang up");
    expect(
      failing.listenerCount("data") +
        failing.listenerCount("end") +
        failing.listenerCount("error"),
      "the failure path has to clean up too",
    ).toBe(0);
  });

  test("challenge - createEmitter() implements the four rules of dispatch", () => {
    const bus = createEmitter();
    const seen: string[] = [];

    expect(
      bus.emit("tick", 1),
      "emit() returns false when nobody was listening - that is how the real " +
        "EventEmitter tells you an event went nowhere",
    ).toBe(false);

    const first = (n: number) => seen.push(`first:${n}`);
    const second = (n: number) => seen.push(`second:${n}`);
    bus.on("tick", first);
    bus.on("tick", second);

    expect(bus.emit("tick", 1), "now there are listeners").toBe(true);
    expect(
      seen,
      "listeners run in registration order, synchronously",
    ).toEqual(["first:1", "second:1"]);

    bus.off("tick", first);
    bus.emit("tick", 2);
    expect(
      seen,
      "off() removes exactly the listener you pass, leaving the others",
    ).toEqual(["first:1", "second:1", "second:2"]);

    let onceCalls = 0;
    bus.once("tick", () => {
      onceCalls += 1;
    });
    bus.emit("tick", 3);
    bus.emit("tick", 4);
    expect(onceCalls, "a once() listener fires exactly once").toBe(1);

    const trail: string[] = [];
    const selfRemoving = () => {
      trail.push("self-removing");
      bus.off("beat", selfRemoving);
    };
    const survivor = () => trail.push("survivor");
    bus.on("beat", selfRemoving);
    bus.on("beat", survivor);
    bus.emit("beat");
    expect(
      trail,
      "a listener that removes itself mid-dispatch must not stop the " +
        "listeners behind it from running - copy the list before you walk it " +
        "(README challenge)",
    ).toEqual(["self-removing", "survivor"]);
    bus.emit("beat");
    expect(
      trail,
      "...and on the next emit it really is gone",
    ).toEqual(["self-removing", "survivor", "survivor"]);
  });

  test("review1 - wrapError() adds context without losing the cause", () => {
    const original = new Error("ECONNREFUSED 127.0.0.1:5432");
    const wrapped = wrapError(original, "loading the user profile");

    expect(
      wrapped.message,
      "the context goes in front of the original message, separated by a " +
        'colon and a space: "loading the user profile: ECONNREFUSED ..."',
    ).toBe("loading the user profile: ECONNREFUSED 127.0.0.1:5432");
    expect(
      wrapped.cause,
      "the original error goes in the standard `cause` property, unchanged - " +
        "that is how a reader gets from your message to the real stack trace",
    ).toBe(original);

    const outer = wrapError(wrapped, "rendering the dashboard");
    expect(
      rootCause(outer),
      "rootCause() walks the cause chain to the bottom and returns the error " +
        "that actually started it",
    ).toBe(original);
    expect(
      rootCause(original),
      "an error with no cause is its own root cause",
    ).toBe(original);
  });
});
```

In plain English:

- **ex1** registers listeners, calls your methods, and inspects what arrived.
  The first assertion runs immediately after `add()` returns, which is what
  makes it a check that `emit` is synchronous rather than a check that it
  happened at all.
- **ex2** looks at the call log *before* awaiting anything: a length of 0
  there is the whole "never call back synchronously" rule. Then it checks the
  three outcomes, one `code` at a time.
- **ex3** exercises the class through `instanceof` (both levels), `name`,
  `stack` and the data properties, then runs four values through your
  classifier — including a thrown string, which is not an `Error` at all.
- **ex4** counts listeners after the promise settles. `listenerCount` is a
  real method on every emitter, and a useful thing to reach for when you
  suspect a leak in production.
- **challenge** walks all four rules, ending with the self-removing listener:
  `selfRemoving` calls `off` on itself in the middle of a dispatch, and
  `survivor` still has to run.
- **review1** checks the message shape, the `cause` link by identity (`toBe`,
  not `toEqual`), and a two-level chain.

## The teaching point

Two habits from this lesson survive into every Node codebase you touch.

**Every emitter needs an error listener, and every listener needs a removal
plan.** Those are the two ways emitters hurt you: a crash you did not expect
and a leak you cannot see. Both are cheap to prevent and expensive to
diagnose.

**Decide, per error, whether the process can continue.** Catch operational
errors close to where they happen and turn them into a response. Let
programmer errors go up and out — and put a process manager underneath so that
"crash" means "restart in 200 ms", not "outage". The anti-pattern is the
top-level `try`/`catch` that logs everything and continues; it converts every
bug into a slow corruption instead of a fast, findable failure.

Next: **05_fs_path**, where the errors stop being hypothetical: files that do
not exist, directories that do, and a path separator that is different on your
machine than on the server.
