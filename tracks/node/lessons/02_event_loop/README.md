# 02 — The event loop

Everything Node does that is worth doing happens because of one loop. Your
program starts, runs its top-level code, and then — instead of exiting —
hands control to libuv, which asks the operating system "is anything ready?",
runs the callbacks for whatever is, and asks again. When nothing is ready and
nothing is scheduled, the loop has nothing to wait for and the process exits.
That is the entire life cycle of every Node server you will ever write.

The reason this lesson exists is that the loop is not a black box. It runs in
*phases*, in a fixed order, with two special queues that jump the line, and
the order is observable from your code. Nearly every "why did that log come
out in that order" question, every "my `await` seems to hang", every
"`setTimeout(fn, 0)` did not run immediately" is answered by the same picture.
Interviewers ask about it constantly, and not out of pedantry: someone who
cannot say what runs before what cannot reason about a race, a starvation bug,
or why a health check times out under load.

So this lesson grades you two ways. Twice you are given a snippet and asked to
**predict** exactly what it prints — the interview question, in code form.
Twice you are asked to **produce** a required ordering, which is the same
knowledge pointed the other way. Nothing here measures elapsed time, so
nothing here is flaky: the gate waits by handing control back to the loop, not
by sleeping.

## Concept — the phases, and the two queues that cut in

One turn of the loop, simplified to the parts you can observe:

```
   ┌───────────────────────────┐
┌─>│          timers           │  setTimeout / setInterval callbacks that are due
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  a few deferred system callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  ← where the loop waits: incoming I/O, fs, sockets
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤       close callbacks     │  'close' events
   └───────────────────────────┘
```

Between **every** callback — not between phases, between individual callbacks
— Node runs a *checkpoint*:

1. drain the **`process.nextTick` queue** completely, including anything added
   while draining;
2. then drain the **microtask queue** completely — promise callbacks (`.then`,
   `catch`, `finally`), `await` continuations, `queueMicrotask` — again
   including anything added while draining;
3. if the nextTick queue refilled during step 2, go back to step 1. Stop only
   when both are empty.

Those two queues are not phases. They are the line-cutters: they run before
the loop is allowed to move on to anything else, which is what makes them
fast and what makes them dangerous. A `process.nextTick` that schedules
another `process.nextTick` forever will hang your server with zero CPU spent
on anything useful and no error message — the loop never gets its turn back.

Here is the whole model in eight lines:

```ts
console.log("1: sync");
setTimeout(() => console.log("5: timer"), 0);
Promise.resolve().then(() => console.log("4: microtask"));
process.nextTick(() => console.log("3: nextTick"));
console.log("2: sync");
```

Synchronous code first, always, because a callback cannot interrupt running
JavaScript. Then the nextTick queue. Then microtasks. Then, in a later phase
of the loop, the timer. The numbers in those labels are the order they print.

Three details you will need below.

**An `async` function body runs synchronously until its first `await`.**
Calling it is not "starting a background task"; it is calling a function that
happens to be able to pause. Everything after the first `await` is a
microtask.

```ts
async function job() {
  console.log("a");      // runs when you call job(), synchronously
  await null;            // <- suspends here, even though null is not a promise
  console.log("b");      // a microtask
}
job();
console.log("c");        // prints between a and b
```

**`setTimeout(fn, 0)` does not mean "now".** It means "queue this for the
timers phase, at least 1 ms from now" (Node clamps 0 to 1). It is a *macrotask*
— a full turn of the loop away, behind every microtask and every nextTick.

**`setImmediate` is the check phase.** From inside an I/O callback, a
`setImmediate` always runs before a `setTimeout(fn, 0)`, because the check
phase comes right after poll. From the top level of a program, which of the
two wins depends on how long the process took to start, and it genuinely
varies run to run — one of the few honest "it depends" answers in this
lesson, and a favourite interview trick question.

**One more thing this gate depends on.** The checkpoint order above —
nextTick first, then microtasks — is what you observe from inside a callback,
which is where server code lives. At the *top level of an ES module* you can
see the opposite, because module evaluation is itself performed as a promise
job, so newly queued microtasks join the drain already in progress while the
nextTick queue waits. Every snippet in this lesson is therefore run by the
gate from inside a timer callback. `reading.md` explains the mechanism; for
now, know that "which context am I in" is a real question with a real answer.

## Exercise 1 — predict this

Edit `ex1/solution.ts`. Here is `ex1/snippet.ts`, exactly as the gate runs it:

```ts
export function run(log: (label: string) => void): void {
  log("start");

  setTimeout(() => log("timeout"), 0);
  Promise.resolve().then(() => log("promise"));
  process.nextTick(() => log("nextTick"));

  log("end");
}
```

Return, from `predictOrder()`, the array of labels in the order they are
logged — five strings, exactly as spelled in the snippet.

The gate runs the snippet for real, collects what happened, and compares. It
will not show you the true order when you are wrong: it tells you how many
lines you got right before the first divergence, and what you predicted at
that position. That is deliberate. The answer is derivable from the Concept
section, and being told it is worth nothing.

```
uv run dojo test node 02_event_loop ex1
```

## Exercise 2 — predict this, but the callbacks schedule more work

Edit `ex2/solution.ts`. `ex2/snippet.ts`:

```ts
export function run(log: (label: string) => void): void {
  log("sync-1");

  process.nextTick(() => {
    log("tick-1");
    process.nextTick(() => log("tick-1-nested"));
  });

  Promise.resolve().then(() => {
    log("promise-1");
    process.nextTick(() => log("tick-from-promise"));
    Promise.resolve().then(() => log("promise-1-inner"));
  });

  queueMicrotask(() => log("microtask-2"));
  setTimeout(() => log("timeout"), 0);

  log("sync-2");
}
```

Nine labels. Everything you need is in the three-step checkpoint from the
Concept section — in particular step 3, which is the only reason
`tick-from-promise` is not the last thing to run before the timer.

Work it out on paper before you run the gate. Guessing costs you the exercise.

```
uv run dojo test node 02_event_loop ex2
```

## Exercise 3 — now produce an ordering

Edit `ex3/solution.ts`. Implement `scheduleAll(log)` so that these four labels
are logged in this order:

```
now
tick
gate-microtask     <- this one is the gate's, not yours
micro
later
```

You log four of those five: `"now"`, `"tick"`, `"micro"`, `"later"`. The gate
queues `"gate-microtask"` as a promise microtask **immediately before** it
calls your function, and it must land between your `"tick"` and your
`"micro"`.

Read that constraint again, because it is the whole exercise. Both of your
callbacks are queued *after* the gate's — you cannot win this by ordering your
statements. You win it by choosing, for each label, the queue whose service
order puts it on the right side of the gate's microtask.

`"later"` must not run in the same checkpoint at all: when the microtasks have
finished, it still has not run.

```
uv run dojo test node 02_event_loop ex3
```

## Exercise 4 — do not hold the loop hostage

Edit `ex4/solution.ts`. Implement:

```ts
processInBatches(items, batchSize, handle): Promise<number>
```

It calls `handle(item)` for every item, in order, in batches of `batchSize`,
and **after each batch — including the last — it yields to the event loop** so
that anything else waiting gets a turn. It returns the number of batches it
processed, which is the number of times it yielded.

This is the practical form of everything above. A loop over 200,000 records
that never yields is a 4-second outage for every other request in flight; the
same loop chunked into batches with a yield between them takes marginally
longer in total and stops being an outage. The gate queues a callback before
calling you and checks that it ran *in the middle* of your work rather than
after it — which is why one particular way of "yielding" fails here, and it is
the one everybody tries first.

```
uv run dojo test node 02_event_loop ex4
```

## Challenge — be the event loop

Edit `challenge/solution.ts`. Implement `predictTaskOrder(tasks)`: a
simulator that, given a list of tasks, returns the order their labels will be
logged in.

```ts
type TaskKind = "sync" | "nextTick" | "micro" | "timer";
interface Task {
  kind: TaskKind;
  label: string;
  spawns?: Task[];   // scheduled, in order, at the moment this task runs
}
```

Each kind means what it says: `sync` runs immediately where it is scheduled,
`nextTick` goes to the nextTick queue, `micro` to the microtask queue, `timer`
to the timers phase. `spawns` is what makes it interesting — a task that
schedules more tasks while it runs, which is where every subtle ordering rule
shows up.

The gate builds three scenarios, runs each one *for real* with
`process.nextTick` / `queueMicrotask` / `setTimeout`, and compares your
prediction against what actually happened. Your model has to agree with the
runtime, not with your memory of a blog post.

Honest difficulty note: the phase ranking is easy and gets you most of the way.
The two things that separate a passing simulator from a nearly-passing one are
the checkpoint *loop* (both queues empty at the same time, not one pass each)
and running the checkpoint again after every single timer callback.

```
uv run dojo test node 02_event_loop challenge
```

## Review

`review1/solution.ts` comes back on the spaced-review schedule. Same job as
ex1 and ex2, on `review1/snippet.ts`:

```ts
export function run(log: (label: string) => void): void {
  log("A");

  const job = (async () => {
    log("B");
    await null;
    log("C");
    return "done";
  })();

  job.then((value) => log(`E:${value}`));
  process.nextTick(() => log("D"));
  setTimeout(() => log("F"), 0);

  log("G");
}
```

Seven labels. Note that one of them is built with a template literal, so
predict its exact text.

```
uv run dojo test node 02_event_loop review1
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
import { describe, expect, test } from "vitest";

import { predictOrder as predictEx1 } from "./ex1/solution";
import { run as runEx1 } from "./ex1/snippet";
import { predictOrder as predictEx2 } from "./ex2/solution";
import { run as runEx2 } from "./ex2/snippet";
import { scheduleAll } from "./ex3/solution";
import { processInBatches } from "./ex4/solution";
import { predictTaskOrder, type Task } from "./challenge/solution";
import { predictOrder as predictReview } from "./review1/solution";
import { run as runReview } from "./review1/snippet";

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** Run `schedule` inside a timer callback and collect everything it logs. */
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

/**
 * Describe where a prediction first parts company with reality - without
 * printing reality, which would hand you the answer.
 */
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

describe("02_event_loop", () => {
  test("ex1 - predictOrder() matches what the snippet really does", async () => {
    const actual = await record(runEx1);
    expect(
      actual.length,
      "sanity check on the gate itself: the ex1 snippet logs five lines",
    ).toBe(5);
    expect(
      divergence(predictEx1(), actual),
      "your prediction does not match the run. sync code first, then the " +
        "checkpoint queues, then timers - reread README ex1",
    ).toBe("");
  });

  test("ex2 - predictOrder() survives nested callbacks", async () => {
    const actual = await record(runEx2);
    expect(
      actual.length,
      "sanity check on the gate itself: the ex2 snippet logs nine lines",
    ).toBe(9);
    expect(
      divergence(predictEx2(), actual),
      "a callback that schedules more work is where the queues get " +
        "interesting: nested nextTicks are drained before any microtask, and " +
        "a nextTick queued from a microtask still beats the timer",
    ).toBe("");
  });

  test("ex3 - scheduleAll() puts each label in the queue it belongs in", async () => {
    const seen: string[] = [];
    const log = (label: string) => seen.push(label);
    let afterReturn: string[] = [];
    let failure: unknown;

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        // The gate queues a microtask of its own *before* calling you. Where
        // your labels land relative to it is what proves which queue you used.
        Promise.resolve().then(() => log("gate-microtask"));
        try {
          scheduleAll(log);
        } catch (error) {
          failure = error;
        }
        afterReturn = [...seen];
        resolve();
      }, 0);
    });
    await settle();
    await settle();
    if (failure) throw failure;

    expect(
      afterReturn,
      "when scheduleAll() returns, only the synchronous label has run - if you " +
        "see more here, you logged something that should have been deferred",
    ).toEqual(["now"]);
    expect(
      seen,
      'the required order is: "now" synchronously, "tick" before the gate ' +
        'microtask (so it must be a nextTick), "micro" after it (so it must be ' +
        'a microtask), and "later" in a later turn of the loop entirely',
    ).toEqual(["now", "tick", "gate-microtask", "micro", "later"]);
  });

  test("ex4 - processInBatches() hands the loop back between batches", async () => {
    const seen: string[] = [];
    setImmediate(() => seen.push("marker"));

    const yields = await processInBatches([1, 2, 3, 4, 5, 6], 2, (item) =>
      seen.push(`item-${item}`),
    );
    await settle();

    expect(
      seen.filter((label) => label.startsWith("item-")),
      "every item must be handled exactly once, in order",
    ).toEqual(["item-1", "item-2", "item-3", "item-4", "item-5", "item-6"]);
    expect(
      seen[0],
      "the first batch runs before any yielding, so item-1 comes first",
    ).toBe("item-1");
    const marker = seen.indexOf("marker");
    expect(
      marker > 0 && marker < seen.length - 1,
      "the callback the gate queued before calling you must get a turn in the " +
        "middle of your work. If it ran last, you never actually yielded - " +
        "awaiting an already-resolved promise is a microtask, not a turn of " +
        "the event loop (README ex4)",
    ).toBe(true);
    expect(
      yields,
      "six items in batches of two is three batches, and you yield after each " +
        "one - including the last",
    ).toBe(3);

    const empty: string[] = [];
    expect(
      await processInBatches([], 3, (item) => empty.push(`item-${item}`)),
      "no items means no batches and nothing to yield after",
    ).toBe(0);
    expect(empty, "there was nothing to handle").toEqual([]);
  });

  test("challenge - predictTaskOrder() models the queues, not just the phases", async () => {
    const runScenario = (tasks: Task[], log: (label: string) => void): void => {
      const runTask = (task: Task): void => {
        log(task.label);
        for (const child of task.spawns ?? []) schedule(child);
      };
      const schedule = (task: Task): void => {
        switch (task.kind) {
          case "sync":
            runTask(task);
            break;
          case "nextTick":
            process.nextTick(() => runTask(task));
            break;
          case "micro":
            queueMicrotask(() => runTask(task));
            break;
          case "timer":
            setTimeout(() => runTask(task), 0);
            break;
        }
      };
      for (const task of tasks) schedule(task);
    };

    const scenarios: Task[][] = [
      [
        { kind: "sync", label: "a" },
        { kind: "nextTick", label: "b", spawns: [{ kind: "micro", label: "b1" }] },
        { kind: "micro", label: "c" },
        { kind: "timer", label: "d" },
      ],
      [
        { kind: "micro", label: "m", spawns: [{ kind: "nextTick", label: "t" }] },
        { kind: "nextTick", label: "n", spawns: [{ kind: "nextTick", label: "n2" }] },
        {
          kind: "timer",
          label: "z",
          spawns: [
            { kind: "micro", label: "z1" },
            { kind: "nextTick", label: "z2" },
          ],
        },
        { kind: "timer", label: "y" },
      ],
      [
        {
          kind: "sync",
          label: "s",
          spawns: [
            { kind: "sync", label: "s1" },
            { kind: "timer", label: "s2" },
          ],
        },
        { kind: "micro", label: "q" },
      ],
    ];

    for (const [index, tasks] of scenarios.entries()) {
      const actual = await record((log) => runScenario(tasks, log));
      expect(
        divergence(predictTaskOrder(tasks), actual),
        `scenario ${index + 1} of ${scenarios.length} does not match. The ` +
          "checkpoint is a loop: drain every nextTick, then every microtask, " +
          "and go round again if either queue refilled - then one timer, then " +
          "the whole checkpoint again",
      ).toBe("");
    }
  });

  test("review1 - predictOrder() reads an async function as scheduling", async () => {
    const actual = await record(runReview);
    expect(
      actual.length,
      "sanity check on the gate itself: the review snippet logs seven lines",
    ).toBe(7);
    expect(
      divergence(predictReview(), actual),
      "an async function body runs synchronously until its first await; the " +
        "rest of it is a microtask - reread README review",
    ).toBe("");
  });
});
```

In plain English:

- `record()` is the harness the prediction exercises share. It schedules the
  snippet inside a timer callback, then hands control back to the loop four
  times so every queue has drained, and returns what was logged. Nothing
  sleeps and nothing measures a clock, which is why this gate cannot be flaky.
- `divergence()` is how the gate tells you that you are wrong without telling
  you what is right: it reports the first position where your array and
  reality part company, and shows you *your* value at that position.
- **ex1** and **ex2** compare your prediction to the real run. The length
  assertion above each one is a sanity check on the gate itself.
- **ex3** snapshots the log the instant your function returns (it must contain
  only `"now"`), and then checks the full sequence including the gate's own
  microtask.
- **ex4** queues a `setImmediate` before calling you and requires it to land
  strictly inside your item list — not first, not last — then checks the
  batch count.
- **challenge** runs three scenarios for real and diffs each against your
  simulator.
- **review1** is ex1 again with an async function in it.

## The teaching point

The event loop is the thing that makes Node's concurrency story work and the
thing that makes it fragile, and both halves come from the same sentence:
**one thread runs your JavaScript, and it only moves on when you return**.
Callbacks do not interrupt each other, so you never need a lock. Nothing else
runs while you are running, so you must not run for long.

In production that translates into a short list of habits. Never do more than
a few milliseconds of synchronous work in a request handler; chunk it, move it
to a worker thread, or push it to a queue. Treat `process.nextTick` as a
sharp tool for library authors, not a general "run this soon" — its
line-cutting is exactly what starves the loop. And when you are debugging an
ordering mystery, do not guess: write the five-line version, run it, and look.
That habit is what exercises 1 and 2 were installing.

Next: **03_async_patterns**, where the queues stop being trivia and start
being the difference between three requests taking 300 ms and 100 ms.
