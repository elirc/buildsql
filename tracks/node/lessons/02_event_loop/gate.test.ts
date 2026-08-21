// Gate for node/02_event_loop. Quoted verbatim in README.md.
//
// Two rules make this gate deterministic, and they are worth understanding
// before you read the tests:
//
//   1. Every snippet is scheduled from inside a *timer callback* - the
//      ordinary context for server code - because the nextTick/microtask
//      order at the top level of an ES module is subtly different. reading.md
//      explains why.
//   2. Nothing here measures elapsed time. The gate waits by handing control
//      back to the loop a fixed number of times, so a slow machine changes
//      nothing.
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
