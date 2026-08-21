# i1 — Interview concepts

You can build the thing. This part of the course is about being able to *say*
how it works, under time pressure, to someone who is deciding whether to hire
you.

The centrepiece of this lesson is not the exercises — it is `reading.md`,
which carries **fifty-five questions with model answers**, grouped by topic,
each tagged by how often it actually comes up:

- ⭐⭐⭐ — expect it. If you cannot answer these, the interview goes badly.
- ⭐⭐ — common, and a good answer separates you from the pack.
- ⭐ — occasional; a strong answer is a bonus.

Every answer is written the way a strong candidate would say it out loud: three
to six sentences, one concrete example, and the follow-up question the
interviewer will ask next. Each is cross-referenced to the lesson that teaches
it, so a shaky answer has an obvious repair — "weak on backpressure → redo
06_buffers_streams".

The four exercises here are the part of that bank a test can hold you to: the
event-loop prediction, the blocking-loop fix, the error taxonomy, and the
require cache. Everything else you check by covering the answer and saying it.

## How to use this lesson

Read `reading.md` **out loud**, one topic at a time, with the answers covered:

```
uv run dojo read node i1_interview_concepts
```

For each question: say your answer to the empty room, then uncover and compare.
Not "did I know it" — *did I say it as well as the model answer*. The gap
between recognising an answer and producing one under pressure is the entire
difference between passing and failing an interview, and it only closes by
speaking.

Mark the ones you fumbled. Redo the lesson each of them points at. Then come
back a week later — `dojo review` will keep bringing the ⭐⭐⭐ material back at
3, 7, 21 and 60 days, which is the mechanism this whole part of the course is
built around.

## Concept — what they are actually testing

Interviewers for a Node role are checking four things, and every question in
the bank is one of them in disguise.

**Do you know the runtime is single-threaded, and what follows from it?** The
event loop, the queues, blocking, `worker_threads`, why Node is good at I/O
and unremarkable at computation. This is the most-asked area by a wide margin.

**Can you handle failure without taking the process down — or leaving it up
when it should go down?** Error-first callbacks, rejected promises,
`uncaughtException`, operational versus programmer errors, graceful shutdown.

**Do you understand data that arrives over time?** Streams, backpressure,
buffers, why you do not read a 2 GB file into a string.

**Can you build a service?** HTTP semantics, middleware, validation, layering,
testing, and the judgement to say "it depends, and here is what it depends
on".

Nobody expects you to have memorised the phase names of libuv. They expect
you to be able to reason about a program you have never seen and predict what
it will do — which is exactly what ex1 asks.

## Exercise 1 — the whiteboard question

Edit `ex1/solution.ts`. Here is `ex1/snippet.ts`, exactly as the gate runs it:

```ts
export function run(log: (label: string) => void): void {
  log("one");

  setTimeout(() => {
    log("two");
    process.nextTick(() => log("three"));
  }, 0);

  Promise.resolve().then(() => log("four"));
  process.nextTick(() => log("five"));
  setTimeout(() => log("six"), 0);

  log("seven");
}
```

Return the seven labels from `predictOrder()`, in the order they are logged.

This is the single most-asked Node interview question and this is the harder
version of it, because one of the timer callbacks schedules a `nextTick` while
it runs. The gate runs the snippet from inside a timer callback — a server's
ordinary context — and tells you where your prediction first diverges without
telling you the answer.

```
uv run dojo test node i1_interview_concepts ex1
```

## Exercise 2 — "the loop is blocked. Fix it."

Edit `ex2/solution.ts`. Implement:

```ts
sumWithoutBlocking(values, chunkSize, onProgress): Promise<number>
```

Add up the values in chunks of `chunkSize`; after each chunk, call
`onProgress(processedSoFar)` — the count of values handled, not the sum — and
**yield to the event loop** so anything else waiting gets a turn.

The gate queues a callback before calling you and requires it to run *in the
middle* of your work. One popular way of "yielding" fails this, and it is the
one candidates reach for first.

```
uv run dojo test node i1_interview_concepts ex2
```

## Exercise 3 — the two error-handling questions

Edit `ex3/solution.ts`. Two functions:

`guardOnce(callback)` wraps an error-first callback so that only the **first**
call gets through and every later one is dropped. A library that calls your
callback twice runs your continuation twice — a doubled charge, a duplicated
retry — and this three-line guard is the standard defence.

`isOperational(error)` answers the taxonomy question:

1. not an `Error` instance → `false` (throwing a non-Error is a bug on its
   own);
2. `error.isOperational === true` → `true`;
3. a `TypeError`, `RangeError`, `ReferenceError` or `SyntaxError` → `false`;
4. otherwise, a Node system-error code — a string of capitals starting with
   `E`, like `ECONNREFUSED` or `ENOENT` → `true`;
5. anything else → `false`.

```
uv run dojo test node i1_interview_concepts ex3
```

## Exercise 4 — the require cache

Edit `ex4/solution.ts`. Next to it sits `counter.cjs`, a CommonJS module that
counts how many times it has been evaluated. Implement:

- `loadCached()` — `require` it normally. Called twice, it returns the *same
  object* and the module body runs once.
- `loadFresh()` — evict it from the require cache first, so the module body
  runs again and you get a new object.

"What is the require cache, and how would you clear it?" is a standard
question, and the good answer includes why you usually should not: after a
fresh load, everyone still holding the old exports keeps them, and your
process now contains two versions of one module.

```
uv run dojo test node i1_interview_concepts ex4
```

## Review

`review1/solution.ts` comes back on the spaced-review schedule. Implement
`handleRequest(userId, work)`: build a per-request context (the user id plus a
`log` function), run `work(context)`, and resolve with
`{ userId, steps }` where `steps` is everything that request logged.

The gate runs two requests that overlap — both suspended at an `await` at the
same time, which is what a server looks like whenever two users arrive
together. An implementation that keeps the current user in a module-level
variable passes every single-request test and fails this one, which is exactly
how that bug reaches production.

```
uv run dojo test node i1_interview_concepts review1
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
import { describe, expect, test } from "vitest";

import { predictOrder } from "./ex1/solution";
import { run as runSnippet } from "./ex1/snippet";
import { sumWithoutBlocking } from "./ex2/solution";
import { guardOnce, isOperational } from "./ex3/solution";
import { loadCached, loadFresh } from "./ex4/solution";
import { handleRequest } from "./review1/solution";

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

async function record(schedule: (log: (label: string) => void) => void): Promise<string[]> {
  const seen: string[] = [];
  let failure: unknown;
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      try {
        schedule((label) => seen.push(label));
      } catch (error) {
        failure = error;
      }
      resolve();
    }, 0);
  });
  await settle();
  await settle();
  await settle();
  await settle();
  if (failure) throw failure;
  return seen;
}

function divergence(prediction: readonly string[], actual: readonly string[]): string {
  if (!Array.isArray(prediction)) return "predictOrder() did not return an array";
  if (prediction.length !== actual.length) {
    return `you predicted ${prediction.length} line(s); ${actual.length} actually ran`;
  }
  const index = actual.findIndex((label, i) => prediction[i] !== label);
  if (index === -1) return "";
  return (
    `the first ${index} line(s) are right, then position ${index} diverges ` +
    `(you predicted "${prediction[index]}", which is not what ran there)`
  );
}

describe("i1_interview_concepts", () => {
  test("ex1 - predictOrder() answers the whiteboard question, cold", async () => {
    const actual = await record(runSnippet);
    expect(actual.length, "sanity check on the gate: the snippet logs seven lines").toBe(7);
    expect(
      divergence(predictOrder(), actual),
      "sync first, then the nextTick queue, then microtasks, then the timers - " +
        "and the checkpoint runs again after EACH timer callback, which is the " +
        "half of the answer most candidates miss",
    ).toBe("");
  });

  test("ex2 - sumWithoutBlocking() shows you know what the single thread costs", async () => {
    const seen: string[] = [];
    setImmediate(() => seen.push("marker"));

    const progress: number[] = [];
    const total = await sumWithoutBlocking(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      3,
      (processed) => {
        progress.push(processed);
        seen.push(`progress-${processed}`);
      },
    );
    await settle();

    expect(total, "the sum of 1..10 is 55, chunked or not").toBe(55);
    expect(
      progress,
      "onProgress reports the RUNNING TOTAL of values handled after each " +
        "chunk: 3, 6, 9, then the short final chunk of one",
    ).toEqual([3, 6, 9, 10]);

    const marker = seen.indexOf("marker");
    expect(
      marker > 0 && marker < seen.length - 1,
      "the callback the gate queued before calling you has to get a turn in " +
        "the middle of the work. If it ran last, you never yielded - and " +
        'awaiting an already-resolved promise is not yielding (README ex2)',
    ).toBe(true);

    const untouched: number[] = [];
    expect(
      await sumWithoutBlocking([], 4, (processed) => untouched.push(processed)),
      "the sum of nothing is 0",
    ).toBe(0);
    expect(untouched, "and there is no progress to report").toEqual([]);
  });

  test("ex3 - guardOnce() and isOperational() are the error-handling questions", async () => {
    const calls: Array<[Error | null, unknown]> = [];
    const guarded = guardOnce<string>((error, value) => calls.push([error, value]));

    guarded(null, "first");
    guarded(null, "second");
    guarded(new Error("late failure"));

    expect(
      calls.length,
      "an error-first callback must be called EXACTLY once. A library that " +
        "calls yours twice runs your continuation twice - a duplicated " +
        "payment, a doubled retry - and the guard is how you survive it",
    ).toBe(1);
    expect(calls[0], "and the call that survives is the first one").toEqual([null, "first"]);

    const seen: string[] = [];
    const buggy = (callback: (error: Error | null, value?: string) => void): void => {
      callback(null, "ok");
      callback(new Error("and again"), undefined); // the bug this guards against
    };
    buggy(guardOnce((error, value) => seen.push(error ? `error:${error.message}` : `ok:${value}`)));
    expect(seen, "the second call is dropped, not forwarded").toEqual(["ok:ok"]);

    expect(
      isOperational(Object.assign(new Error("connect ECONNREFUSED"), { code: "ECONNREFUSED" })),
      "a system error carrying a code like ECONNREFUSED is the world " +
        "misbehaving, not your program: operational, handle it and carry on",
    ).toBe(true);
    expect(
      isOperational(Object.assign(new Error("bad email"), { isOperational: true })),
      "an error you marked yourself is operational by definition",
    ).toBe(true);
    expect(
      isOperational(new TypeError("cannot read properties of undefined")),
      "a TypeError is a bug in your code. The process cannot know what state " +
        "it is in, so the honest answer is to crash and be restarted",
    ).toBe(false);
    expect(
      isOperational(new Error("something went wrong")),
      "an unmarked, uncoded error is guilty until proven innocent",
    ).toBe(false);
    expect(
      isOperational({ isOperational: true }),
      "a thrown object that is not an Error is a bug on its own - it has no " +
        "stack, and every catch in the codebase now has two shapes to handle",
    ).toBe(false);
  });

  test("ex4 - the require cache is a fact about your process, not a detail", () => {
    const first = loadCached();
    const second = loadCached();

    expect(
      first,
      "require() caches by resolved filename: the second call returns the very " +
        "same object, and the module body never ran again",
    ).toBe(second);
    expect(
      first.loads,
      "the shipped module counts how many times it has been evaluated - once",
    ).toBe(1);

    const fresh = loadFresh();
    expect(
      fresh,
      "deleting the cache entry before requiring forces a re-evaluation, so " +
        "this is a different object (README ex4)",
    ).not.toBe(first);
    expect(fresh.loads, "and the module body ran a second time").toBe(2);

    expect(
      loadCached(),
      "a fresh load repopulates the cache, so the next cached load returns " +
        "the NEW instance - which is exactly why this trick is a footgun: " +
        "everyone holding the old object keeps it forever",
    ).toBe(fresh);

    expect(loadFresh(), "and again").not.toBe(fresh);
  });

  test("review1 - per-request state, the mistake that only shows up under load", async () => {
    const release: Array<() => void> = [];
    const pause = (): Promise<void> =>
      new Promise<void>((resolve) => {
        release.push(resolve);
      });

    const alice = handleRequest("alice", async (context) => {
      context.log("start");
      await pause();
      context.log(`finish:${context.userId}`);
    });
    const bob = handleRequest("bob", async (context) => {
      context.log("start");
      await pause();
      context.log(`finish:${context.userId}`);
    });

    // Both are now suspended mid-request, which is the situation a server is
    // in whenever two requests overlap.
    await settle();
    for (const resolve of release) resolve();

    expect(
      await alice,
      "each request keeps its own context. If you stored the user in a " +
        "module-level variable, bob overwrote alice while she was awaiting - " +
        "and nothing in your tests would show it until two users arrived at " +
        "once (README review)",
    ).toEqual({ userId: "alice", steps: ["start", "finish:alice"] });
    expect(await bob, "and bob keeps his").toEqual({
      userId: "bob",
      steps: ["start", "finish:bob"],
    });
  });
});
```

In plain English:

- **ex1** runs the snippet for real and compares your array against it,
  reporting only *where* you diverge.
- **ex2** checks the sum, the progress reports, and that the gate's own
  callback ran somewhere in the middle of your work.
- **ex3** calls your guarded callback three times and expects one call
  through, then runs five values through the classifier — including a plain
  object that claims to be operational.
- **ex4** checks object identity (`toBe`, not `toEqual`) and the module's own
  load counter, then proves that a fresh load repopulates the cache.
- **review1** starts two requests, lets both suspend, then releases them and
  checks that neither saw the other's state.

## The teaching point

Interviews reward *saying* things, and the only way to get good at saying
things is to say them. Reading the bank silently produces the feeling of
knowing without the ability to produce, which is the trap this lesson is
designed around: cover the answer, speak, compare.

The other thing worth internalising is that the best answers name a trade-off.
"`process.nextTick` runs before promises" is a fact. "`process.nextTick` runs
before promises, which is what makes it useful for library authors who need to
run after the current operation but before anything else — and also what makes
it a starvation risk, so in application code I reach for `setImmediate`" is an
engineer talking. Every model answer in `reading.md` is written in that second
voice; borrow it.

Next: **i2_interview_drills**, six timed, hands-on tasks of the kind you will
actually be given.
