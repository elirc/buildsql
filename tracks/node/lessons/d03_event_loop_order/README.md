# d03 — Event loop order

Five predictions and three pieces of code, all drilling one skill: knowing which
queue a callback is in and when that queue runs. This is lesson **02_event_loop**
made automatic — if problem 1 is not instant, go back and reread it, because
problems 3 and 7 assume you can do problem 1 in your head.

Every snippet is scheduled from inside a **timer callback**, the ordinary
context for server code, because the ordering at the top level of an ES module
is subtly different. The gate never prints the right answer: it tells you the
first position where your prediction and reality parted company.

## Problem 1 — the four queues

Edit `ex1/solution.ts`. `predictOrder()` returns the five labels `./snippet.ts`
logs, in order. The snippet is reproduced in the file.

```
uv run dojo test node d03_event_loop_order ex1
```

## Problem 2 — callbacks that schedule more callbacks

Edit `ex2/solution.ts`. Six labels this time, and two of them are queued from
inside another callback — one onto a queue that has not run yet, one onto a
queue that has already been drained.

```
uv run dojo test node d03_event_loop_order ex2
```

## Problem 3 — an async function is a scheduling instruction

Edit `ex3/solution.ts`. Seven labels: two nested async functions and a two-link
`.then` chain. Count the microtask hops rather than reading it as a program.

```
uv run dojo test node d03_event_loop_order ex3
```

## Problem 4 — one label per queue

Edit `ex4/solution.ts`. `scheduleLabels(log)` logs `sync` immediately, then
arranges for `tick`, `micro`, `check` and `timer` to come out in that order. The
gate queues a microtask of its own *before* calling you, and expects it to land
between `tick` and `micro` — which is what proves which queue each label went
into.

```
uv run dojo test node d03_event_loop_order ex4
```

## Problem 5 — starvation, and the cure

Edit `ex5/solution.ts`. Both functions handle every item in order and resolve
when done, one item per scheduled callback. `drainQueue` uses the queue that
re-enters the checkpoint, so a `setImmediate` queued before the call gets no
turn until the drain finishes. `drainQueueFairly` uses the one that completes a
turn of the loop between items, so it does.

```
uv run dojo test node d03_event_loop_order ex5
```

## Problem 6 — a queue that refills itself

Edit `ex6/solution.ts`. Six labels. A `process.nextTick` callback re-arms itself
twice; a microtask and a timer are waiting.

```
uv run dojo test node d03_event_loop_order ex6
```

## Problem 7 — a chain is not a block

Edit `ex7/solution.ts`. Nine labels: a three-link `.then` chain, two bare
microtasks and an async function with two awaits, all queued during the same
synchronous run. This is the hard one; do it with a written-out queue.

```
uv run dojo test node d03_event_loop_order ex7
```

## Problem 8 — map a list without blocking the loop

Edit `ex8/solution.ts`. `yieldingMap(items, size, fn)` maps in chunks of `size`,
handing the event loop a full turn **between** chunks and not after the last,
and resolves to `{ results, yields }` with results in input order. Five items in
chunks of two is three chunks and two yields.

```
uv run dojo test node d03_event_loop_order ex8
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
// Gate for node/d03_event_loop_order. Quoted verbatim in README.md.
//
// Two rules keep this deterministic, and they are the same two lesson 02 used:
//
//   1. Every snippet is scheduled from inside a *timer callback* - the ordinary
//      context for server code - because the nextTick/microtask order at the
//      top level of an ES module is subtly different.
//   2. Nothing here measures elapsed time. The gate waits by handing control
//      back to the loop a fixed number of times, so a slow machine changes
//      nothing.
import { describe, expect, test } from "vitest";

import { predictOrder as predictEx1 } from "./ex1/solution";
import { run as runEx1 } from "./ex1/snippet";
import { predictOrder as predictEx2 } from "./ex2/solution";
import { run as runEx2 } from "./ex2/snippet";
import { predictOrder as predictEx3 } from "./ex3/solution";
import { run as runEx3 } from "./ex3/snippet";
import { scheduleLabels } from "./ex4/solution";
import { drainQueue, drainQueueFairly } from "./ex5/solution";
import { predictOrder as predictEx6 } from "./ex6/solution";
import { run as runEx6 } from "./ex6/snippet";
import { predictOrder as predictEx7 } from "./ex7/solution";
import { run as runEx7 } from "./ex7/snippet";
import { yieldingMap } from "./ex8/solution";

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
 * Where a prediction first parts company with reality - without printing
 * reality, which would hand over the answer.
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

describe("d03_event_loop_order", () => {
  test("ex1 - predictOrder() puts the four queues in order", async () => {
    const actual = await record(runEx1);
    expect(actual.length, "sanity check on the gate: this snippet logs five lines").toBe(5);
    expect(
      divergence(predictEx1(), actual),
      "all the synchronous code first, then the nextTick queue, then the " +
        "microtask queue, then the timer - reread README problem 1",
    ).toBe("");
  });

  test("ex2 - predictOrder() survives callbacks that schedule more work", async () => {
    const actual = await record(runEx2);
    expect(actual.length, "sanity check on the gate: this snippet logs six lines").toBe(6);
    expect(
      divergence(predictEx2(), actual),
      "the checkpoint is a loop: drain every nextTick, then every microtask, " +
        "and if either queue refilled go round again. A microtask queued from " +
        "a nextTick joins the microtasks already waiting; a nextTick queued " +
        "from a microtask waits for the next lap",
    ).toBe("");
  });

  test("ex3 - predictOrder() reads an async function as a scheduling instruction", async () => {
    const actual = await record(runEx3);
    expect(actual.length, "sanity check on the gate: this snippet logs seven lines").toBe(7);
    expect(
      divergence(predictEx3(), actual),
      "an async function body runs synchronously up to its first await, and " +
        "everything after that await is a microtask. Awaiting the promise of " +
        "another async function is not free - count the hops",
    ).toBe("");
  });

  test("ex4 - scheduleLabels() puts each label in the queue it belongs in", async () => {
    const seen: string[] = [];
    const log = (label: string) => seen.push(label);
    let afterReturn: string[] = [];
    let failure: unknown;

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        // The gate queues a microtask of its own *before* calling you. Where
        // your labels land relative to it is what proves which queue you used.
        Promise.resolve().then(() => log("gate-micro"));
        try {
          scheduleLabels(log);
        } catch (error) {
          failure = error;
        }
        afterReturn = [...seen];
        resolve();
      }, 0);
    });
    await settle();
    await settle();
    await settle();
    if (failure) throw failure;

    expect(
      afterReturn,
      "when scheduleLabels() returns, only the synchronous label has run - " +
        "anything else here is a label you failed to defer",
    ).toEqual(["sync"]);
    expect(
      seen,
      "the required order is: sync immediately, tick before the gate microtask " +
        "(so it is a nextTick), micro after it (so it is a microtask), then " +
        "check, then timer. That last pair is the point: scheduled from inside " +
        "a timer callback, setImmediate always beats a fresh setTimeout(0)",
    ).toEqual(["sync", "tick", "gate-micro", "micro", "check", "timer"]);
  });

  test("ex5 - a nextTick loop starves the loop and a setImmediate loop does not", async () => {
    const starved: string[] = [];
    setImmediate(() => starved.push("probe"));
    await drainQueue([1, 2, 3], (item) => starved.push(`item-${item}`));

    expect(
      starved,
      "every item is handled exactly once, in order",
    ).toEqual(["item-1", "item-2", "item-3"]);
    expect(
      starved.includes("probe"),
      "and the callback queued BEFORE the drain started still has not run. " +
        "That is starvation: process.nextTick re-enters the checkpoint without " +
        "ever reaching a loop phase, so nothing else gets a turn",
    ).toBe(false);
    await settle();
    expect(
      starved.includes("probe"),
      "it does run eventually, once the drain stops feeding the queue",
    ).toBe(true);

    const fair: string[] = [];
    setImmediate(() => fair.push("probe"));
    await drainQueueFairly([1, 2, 3], (item) => fair.push(`item-${item}`));

    expect(
      fair.filter((label) => label.startsWith("item-")),
      "the fair version handles the same items in the same order",
    ).toEqual(["item-1", "item-2", "item-3"]);
    const probeAt = fair.indexOf("probe");
    expect(
      probeAt > 0 && probeAt < fair.length - 1,
      "but the probe gets its turn in the MIDDLE of the work, because " +
        "setImmediate hands control back to the loop between items. If the " +
        "probe is last you scheduled with something that never leaves the " +
        "checkpoint; if it is first you yielded before doing any work",
    ).toBe(true);
  });

  test("ex6 - predictOrder() knows what a recursive nextTick does", async () => {
    const actual = await record(runEx6);
    expect(actual.length, "sanity check on the gate: this snippet logs six lines").toBe(6);
    expect(
      divergence(predictEx6(), actual),
      "the nextTick queue is drained to exhaustion, including everything " +
        "pushed onto it while it is being drained. Nothing else runs until it " +
        "is empty - not the microtask, and certainly not the timer",
    ).toBe("");
  });

  test("ex7 - predictOrder() interleaves a promise chain with plain microtasks", async () => {
    const actual = await record(runEx7);
    expect(actual.length, "sanity check on the gate: this snippet logs nine lines").toBe(9);
    expect(
      divergence(predictEx7(), actual),
      "a .then chain does NOT run end to end: each link is one microtask, and " +
        "the next link is only queued when the previous one returns. Anything " +
        "already waiting goes in between",
    ).toBe("");
  });

  test("ex8 - yieldingMap() hands the loop back between chunks", async () => {
    const seen: string[] = [];
    setImmediate(() => seen.push("probe"));

    const { results, yields } = await yieldingMap([1, 2, 3, 4, 5], 2, (item, index) => {
      seen.push(`item-${item}`);
      return item * 10 + index;
    });

    expect(
      results,
      "every item is mapped exactly once, in input order, and the worker gets " +
        "the index alongside the item",
    ).toEqual([10, 21, 32, 43, 54]);
    expect(
      seen.filter((label) => label.startsWith("item-")),
      "handled in order, no repeats",
    ).toEqual(["item-1", "item-2", "item-3", "item-4", "item-5"]);
    expect(
      seen.indexOf("probe"),
      "the first chunk runs before any yielding, and then the loop gets a " +
        "turn - so the probe queued before the call lands right after item-2. " +
        "Awaiting an already-resolved promise is a microtask, not a turn of " +
        "the event loop, and would leave the probe at the very end",
    ).toBe(2);
    expect(
      yields,
      "five items in chunks of two is three chunks, and you hand the loop back " +
        "BETWEEN chunks - so twice, not three times",
    ).toBe(2);

    const empty = await yieldingMap([], 3, (item: number) => item);
    expect(empty, "nothing in, nothing out, and nothing to yield between").toEqual({
      results: [],
      yields: 0,
    });
  });
});
```

In plain English:

- **ex1, ex2, ex3, ex6, ex7** each run their snippet for real inside a timer
  callback, check the gate's own sanity (how many lines the snippet logs) and
  then report the first position your prediction diverges at.
- **ex4** queues a microtask before calling you, snapshots what has run by the
  time you return, and then compares the whole sequence.
- **ex5** queues a `setImmediate` probe, runs both drains, and checks the probe
  is shut out of one and slotted into the middle of the other.
- **ex8** pins the probe to exactly position 2, checks the mapped values and the
  index argument, checks the yield count, and checks the empty case.

Next: **d04_timers_micro**, the same queues with a clock attached.
