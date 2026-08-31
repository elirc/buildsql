# d04 — Timers and microtasks

Eight problems on the two ways to make something happen later: put it in the
microtask queue, or hand it to a timer. Lesson **02_event_loop** is where the
queues were taught; this set is about the tools built on top of them, and about
writing them so they can be tested without anybody waiting.

Everything runs under vitest fake timers, and where an implementation needs to
know the wall clock it is **handed** one. If that pairing is new, read problem 7
first — it is the reason the rest of the set is instant.

## Problem 1 — the two waits

Edit `ex1/solution.ts`. `delay(ms)` resolves after `ms`, leaving no timer
behind. `immediate()` resolves on the microtask queue and must arm **no timer at
all** — the gate counts them.

```
uv run dojo test node d04_timers_micro ex1
```

## Problem 2 — an interval you can actually stop

Edit `ex2/solution.ts`. `createTicker({ intervalMs, onTick })` returns
`{ start, stop, ticks, running }`. Constructing arms nothing; `onTick` gets 1,
2, 3 …; `start()` on a running ticker and `stop()` on a stopped one are both
no-ops; `stop()` leaves no timer armed; the count survives a restart.

```
uv run dojo test node d04_timers_micro ex2
```

## Problem 3 — debounce

Edit `ex3/solution.ts`. `debounce(fn, waitMs)` returns a function that runs `fn`
once, `waitMs` after the **last** call, with that call's arguments. Every call
restarts the wait and there is never more than one timer. It also carries
`cancel()` and `pending()`.

```
uv run dojo test node d04_timers_micro ex3
```

## Problem 4 — throttle

Edit `ex4/solution.ts`. `throttle(fn, waitMs)` runs `fn` immediately, then at
most once per `waitMs`. Calls inside a window are suppressed; the last of them
runs when the window closes, and that run opens a new window. A window that
closes with nothing suppressed runs nothing and arms nothing.

```
uv run dojo test node d04_timers_micro ex4
```

## Problem 5 — poll with a budget

Edit `ex5/solution.ts`. `pollUntil(check, { intervalMs, timeoutMs })` checks
immediately, then every `intervalMs`. It resolves with the number of checks made
as soon as one returns true, or rejects with `timed out after 250ms`. Either
way it stops checking and leaves no timer armed.

```
uv run dojo test node d04_timers_micro ex5
```

## Problem 6 — virtual time, no timers

Edit `ex6/solution.ts`. `createScheduler()` starts at time 0 and offers
`at(time, run)`, `advanceTo(time)` (returns how many callbacks ran), `now()` and
`pending()`. Due callbacks run in time order, ties in insertion order, and
anything a callback schedules inside the window you are advancing through runs
in the same advance. Going backwards throws `time cannot go backwards`.

```
uv run dojo test node d04_timers_micro ex6
```

## Problem 7 — an interval that does not drift

Edit `ex7/solution.ts`. `createSelfCorrectingInterval({ intervalMs, now,
onTick })` puts tick *n* at `startedAt + n * intervalMs` whatever the handler
cost: a handler that burns 30ms is followed by a 70ms wait, not another 100ms
one. The delay is computed from `now()` every time and never goes negative.

```
uv run dojo test node d04_timers_micro ex7
```

## Problem 8 — many deadlines, one timer

Edit `ex8/solution.ts`. `createDelayQueue(now)` returns `{ enqueue, size }`.
`enqueue(delayMs, run)` returns a cancel function that is safe to call twice.
However many entries are waiting, the queue holds **exactly one** underlying
timer aimed at the earliest deadline — and none when it is empty. Entries run in
deadline order, ties in insertion order.

```
uv run dojo test node d04_timers_micro ex8
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
// Gate for node/d04_timers_micro. Quoted verbatim in README.md.
//
// Nothing here sleeps. Every timed problem runs under vitest fake timers, and
// where an implementation needs to know the wall clock it is handed one, so the
// gate can move time forward by hand. A drill about timers that took real
// seconds to grade would be a drill nobody runs twice.
import { describe, expect, test, vi } from "vitest";

import { delay, immediate } from "./ex1/solution";
import { createTicker } from "./ex2/solution";
import { debounce } from "./ex3/solution";
import { throttle } from "./ex4/solution";
import { pollUntil } from "./ex5/solution";
import { createScheduler } from "./ex6/solution";
import { createSelfCorrectingInterval } from "./ex7/solution";
import { createDelayQueue } from "./ex8/solution";

describe("d04_timers_micro", () => {
  test("ex1 - delay() waits on the loop and immediate() waits on a microtask", async () => {
    vi.useFakeTimers();
    try {
      const order: string[] = [];

      const soon = immediate().then(() => order.push("immediate"));
      expect(
        vi.getTimerCount(),
        "immediate() resolves on the microtask queue, so it must not create a " +
          "timer at all - setTimeout(fn, 0) is a whole turn of the event loop " +
          "later and is not the same thing",
      ).toBe(0);

      const later = delay(50).then(() => order.push("delay"));
      expect(vi.getTimerCount(), "delay() arms exactly one timer").toBe(1);

      await vi.advanceTimersByTimeAsync(0);
      expect(
        order,
        "with no time moved at all the microtask has already run and the timer " +
          "has not",
      ).toEqual(["immediate"]);

      await vi.advanceTimersByTimeAsync(49);
      expect(order, "at 49ms of a 50ms wait, still nothing").toEqual(["immediate"]);

      await vi.advanceTimersByTimeAsync(1);
      expect(order, "and at 50ms it resolves").toEqual(["immediate", "delay"]);

      await soon;
      await later;
      expect(
        vi.getTimerCount(),
        "a resolved delay leaves no timer behind - a stray one keeps the whole " +
          "process alive after the work is finished",
      ).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  test("ex2 - createTicker() starts, counts and really stops", () => {
    vi.useFakeTimers();
    try {
      const seen: number[] = [];
      const ticker = createTicker({ intervalMs: 100, onTick: (n) => seen.push(n) });

      expect(
        vi.getTimerCount(),
        "constructing a ticker must not arm anything - start() is a separate " +
          "decision",
      ).toBe(0);
      expect(ticker.running(), "and it is not running").toBe(false);

      ticker.start();
      expect(vi.getTimerCount(), "now one timer is armed").toBe(1);
      ticker.start();
      expect(
        vi.getTimerCount(),
        "starting an already-running ticker must be a no-op. A second interval " +
          "here is a leak you cannot clear, because the handle is lost",
      ).toBe(1);

      vi.advanceTimersByTime(250);
      expect(
        seen,
        "two ticks in 250ms of a 100ms interval, numbered from one",
      ).toEqual([1, 2]);

      ticker.stop();
      expect(vi.getTimerCount(), "stop() clears the interval").toBe(0);
      expect(ticker.running(), "and says so").toBe(false);
      vi.advanceTimersByTime(1_000);
      expect(seen, "a stopped ticker does not tick").toEqual([1, 2]);

      ticker.stop();
      ticker.start();
      vi.advanceTimersByTime(100);
      expect(
        seen,
        "stopping twice is harmless, and restarting continues the count rather " +
          "than resetting it",
      ).toEqual([1, 2, 3]);
      expect(ticker.ticks(), "ticks() reports the running total").toBe(3);
      ticker.stop();
    } finally {
      vi.useRealTimers();
    }
  });

  test("ex3 - debounce() collapses a burst into its last call", () => {
    vi.useFakeTimers();
    try {
      const calls: string[] = [];
      const save = debounce((value: string) => calls.push(value), 200);

      save("a");
      expect(calls, "nothing runs on the leading edge of a debounce").toEqual([]);
      expect(save.pending(), "but a call is waiting").toBe(true);

      vi.advanceTimersByTime(150);
      save("b");
      vi.advanceTimersByTime(150);
      expect(
        calls,
        "300ms have passed but the second call reset the clock, so only 150ms " +
          "of quiet have. That reset is the entire behaviour",
      ).toEqual([]);
      expect(
        vi.getTimerCount(),
        "and there is still exactly one timer - each call replaces the " +
          "previous one rather than adding to it",
      ).toBe(1);

      vi.advanceTimersByTime(50);
      expect(
        calls,
        "200ms of quiet after the last call, so it runs once, with the LAST " +
          "arguments",
      ).toEqual(["b"]);
      expect(save.pending(), "and nothing is waiting any more").toBe(false);
      expect(vi.getTimerCount(), "nor is any timer").toBe(0);

      save("c");
      expect(save.pending(), "a fresh call schedules again").toBe(true);
      save.cancel();
      expect(save.pending(), "cancel() drops it").toBe(false);
      expect(vi.getTimerCount(), "and clears the timer").toBe(0);
      vi.advanceTimersByTime(1_000);
      expect(calls, "a cancelled call never runs").toEqual(["b"]);
    } finally {
      vi.useRealTimers();
    }
  });

  test("ex4 - throttle() runs on the leading edge and once more at the end", () => {
    vi.useFakeTimers();
    try {
      const calls: number[] = [];
      const send = throttle((n: number) => calls.push(n), 100);

      send(1);
      expect(
        calls,
        "the first call runs immediately - that is the difference from a " +
          "debounce, and it is why a throttle feels responsive",
      ).toEqual([1]);

      send(2);
      send(3);
      expect(calls, "calls inside the window do not run yet").toEqual([1]);

      vi.advanceTimersByTime(100);
      expect(
        calls,
        "at the end of the window the suppressed calls collapse into one, with " +
          "the LAST arguments - 2 was superseded before it ever ran",
      ).toEqual([1, 3]);

      vi.advanceTimersByTime(1_000);
      expect(calls, "nothing was pending, so nothing more runs").toEqual([1, 3]);
      expect(
        vi.getTimerCount(),
        "and the window closes without leaving a timer armed forever",
      ).toBe(0);

      send(4);
      expect(calls, "a call after the window is a leading edge again").toEqual([1, 3, 4]);
      vi.advanceTimersByTime(100);
      expect(
        calls,
        "and with nothing suppressed there is no trailing call - a throttle " +
          "that always fires twice is a throttle that doubles your traffic",
      ).toEqual([1, 3, 4]);
      expect(vi.getTimerCount(), "no timer left").toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  test("ex5 - pollUntil() checks now, then on an interval, then gives up", async () => {
    vi.useFakeTimers();
    try {
      let ready = false;
      let checks = 0;
      const found = pollUntil(
        () => {
          checks += 1;
          return ready;
        },
        { intervalMs: 100, timeoutMs: 1_000 },
      );
      found.catch(() => {});

      expect(
        checks,
        "the first check happens straight away: polling something that is " +
          "already true must not cost an interval",
      ).toBe(1);

      await vi.advanceTimersByTimeAsync(250);
      expect(checks, "then once per interval - at 100 and at 200").toBe(3);

      ready = true;
      await vi.advanceTimersByTimeAsync(50);
      expect(
        await found,
        "it resolves with the number of checks it took, and the fourth one at " +
          "300ms is the one that succeeded",
      ).toBe(4);
      expect(
        vi.getTimerCount(),
        "success has to clear the timeout as well as the interval",
      ).toBe(0);

      let attempts = 0;
      const doomed = pollUntil(
        () => {
          attempts += 1;
          return false;
        },
        { intervalMs: 100, timeoutMs: 250 },
      );
      const outcome = doomed.then(
        () => undefined,
        (error: unknown) => error as Error,
      );
      await vi.advanceTimersByTimeAsync(250);

      const error = await outcome;
      expect(error, "giving up is a rejection, not a resolved false").toBeInstanceOf(Error);
      expect(
        error?.message,
        "and the message names the budget, because that is the number the " +
          "reader has to decide whether to raise",
      ).toBe("timed out after 250ms");
      expect(attempts, "checks at 0, 100 and 200 - three of them").toBe(3);

      await vi.advanceTimersByTimeAsync(1_000);
      expect(
        attempts,
        "and the polling really stopped: a timed-out poll that keeps running " +
          "is a leak that outlives the request that started it",
      ).toBe(3);
      expect(vi.getTimerCount(), "with nothing left armed").toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  test("ex6 - createScheduler() runs virtual time in order", () => {
    const log: string[] = [];
    const scheduler = createScheduler();

    scheduler.at(30, () => log.push("c"));
    scheduler.at(10, () => log.push("a"));
    scheduler.at(10, () => log.push("b"));

    expect(scheduler.now(), "a new scheduler starts at zero").toBe(0);
    expect(scheduler.pending(), "three callbacks are waiting").toBe(3);

    expect(
      scheduler.advanceTo(10),
      "advancing to 10 runs the two due callbacks and reports how many ran",
    ).toBe(2);
    expect(
      log,
      "due at the same instant means insertion order decides, not the order " +
        "you happen to store them in",
    ).toEqual(["a", "b"]);
    expect(scheduler.now(), "and time is now 10").toBe(10);

    expect(scheduler.advanceTo(20), "nothing is due at 20").toBe(0);
    expect(scheduler.advanceTo(30), "c is due at 30").toBe(1);
    expect(log).toEqual(["a", "b", "c"]);
    expect(scheduler.pending(), "the queue is empty").toBe(0);

    scheduler.at(40, () => {
      log.push("d");
      scheduler.at(45, () => log.push("e"));
      scheduler.at(60, () => log.push("f"));
    });
    expect(
      scheduler.advanceTo(50),
      "a callback may schedule more work, and anything it schedules inside the " +
        "window you are advancing through must run in the same advance",
    ).toBe(2);
    expect(log).toEqual(["a", "b", "c", "d", "e"]);
    expect(scheduler.pending(), "f is still in the future").toBe(1);

    expect(
      () => scheduler.advanceTo(20),
      "virtual time only moves forwards. Silently ignoring a backwards jump " +
        "hides the bug in the caller that made it",
    ).toThrow("time cannot go backwards");
  });

  test("ex7 - createSelfCorrectingInterval() pays back the time the work took", async () => {
    vi.useFakeTimers();
    try {
      let clock = 1_000;
      const seen: number[] = [];
      const advance = async (ms: number): Promise<void> => {
        clock += ms;
        await vi.advanceTimersByTimeAsync(ms);
      };

      const ticker = createSelfCorrectingInterval({
        intervalMs: 100,
        now: () => clock,
        onTick: (n) => {
          seen.push(n);
          clock += 30; // the tick itself takes 30ms of wall clock
        },
      });

      ticker.start();
      expect(vi.getTimerCount(), "one timer armed for the first tick").toBe(1);

      await advance(100);
      expect(seen, "the first tick lands one interval after start").toEqual([1]);

      await advance(69);
      expect(
        seen,
        "the handler burned 30ms, so the next tick is due 70ms later, not 100. " +
          "At 69 it has not happened",
      ).toEqual([1]);
      await advance(1);
      expect(
        seen,
        "and at 70 it has. A plain setInterval would have drifted 30ms per " +
          "tick; this one is still on the original grid",
      ).toEqual([1, 2]);

      ticker.stop();
      expect(vi.getTimerCount(), "stop() clears the pending timer").toBe(0);
      await advance(1_000);
      expect(seen, "and no more ticks arrive").toEqual([1, 2]);

      let slowClock = 0;
      const slowSeen: number[] = [];
      const slow = createSelfCorrectingInterval({
        intervalMs: 100,
        now: () => slowClock,
        onTick: (n) => {
          slowSeen.push(n);
          if (n === 1) slowClock += 150; // overran the whole interval
        },
      });
      slow.start();
      slowClock += 100;
      await vi.advanceTimersByTimeAsync(100);
      expect(slowSeen, "the first tick lands on schedule").toEqual([1]);

      await vi.advanceTimersByTimeAsync(1);
      expect(
        slowSeen,
        "the handler overran its own interval by 50ms, so the next tick is " +
          "already late and must fire at the first opportunity. Clamp the " +
          "computed delay at zero - always using intervalMs would put this " +
          "tick 100ms out",
      ).toEqual([1, 2]);

      await vi.advanceTimersByTimeAsync(49);
      expect(
        slowSeen,
        "having caught up, the schedule is back on the original grid - the " +
          "third tick is 50ms after the second, not 100",
      ).toEqual([1, 2]);
      await vi.advanceTimersByTimeAsync(1);
      expect(slowSeen, "and there it is").toEqual([1, 2, 3]);
      slow.stop();
    } finally {
      vi.useRealTimers();
    }
  });

  test("ex8 - createDelayQueue() keeps one timer for the whole queue", async () => {
    vi.useFakeTimers();
    try {
      let clock = 0;
      const log: string[] = [];
      const advance = async (ms: number): Promise<void> => {
        clock += ms;
        await vi.advanceTimersByTimeAsync(ms);
      };
      const queue = createDelayQueue(() => clock);

      expect(vi.getTimerCount(), "an empty queue holds no timer").toBe(0);

      queue.enqueue(300, () => log.push("c"));
      expect(vi.getTimerCount(), "the first entry arms one").toBe(1);
      queue.enqueue(100, () => log.push("a"));
      queue.enqueue(200, () => log.push("b"));
      expect(
        vi.getTimerCount(),
        "and three entries still hold exactly one timer, re-aimed at the " +
          "earliest deadline. One timer per entry is how a queue of ten " +
          "thousand jobs becomes ten thousand handles",
      ).toBe(1);
      expect(queue.size(), "three entries waiting").toBe(3);

      await advance(100);
      expect(log, "the earliest deadline fires first, whenever it was added").toEqual([
        "a",
      ]);
      expect(queue.size(), "two left").toBe(2);
      expect(vi.getTimerCount(), "still one timer, now aimed at b").toBe(1);

      await advance(200);
      expect(
        log,
        "both remaining deadlines are now in the past, so both run, in " +
          "deadline order",
      ).toEqual(["a", "b", "c"]);
      expect(queue.size(), "the queue is empty").toBe(0);
      expect(vi.getTimerCount(), "so nothing is armed").toBe(0);

      const cancelEarly = queue.enqueue(50, () => log.push("x"));
      queue.enqueue(75, () => log.push("y"));
      cancelEarly();
      expect(queue.size(), "cancelling removes the entry").toBe(1);
      cancelEarly();
      expect(queue.size(), "and cancelling twice is harmless").toBe(1);

      await advance(75);
      expect(
        log,
        "cancelling the earliest entry has to re-aim the timer at the next " +
          "one, or the whole queue stalls until something else wakes it",
      ).toEqual(["a", "b", "c", "y"]);
      expect(vi.getTimerCount(), "and the queue is empty again").toBe(0);

      queue.enqueue(10, () => log.push("t1"));
      queue.enqueue(10, () => log.push("t2"));
      await advance(10);
      expect(
        log.slice(-2),
        "two entries with the same deadline run in the order they were added",
      ).toEqual(["t1", "t2"]);
    } finally {
      vi.useRealTimers();
    }
  });
});
```

In plain English:

- **ex1** counts timers after each call and checks the microtask resolves with
  no time moved at all.
- **ex2** checks nothing is armed before `start`, that a double start does not
  arm a second interval, the tick numbers, and that `stop` really clears.
- **ex3** interrupts a wait halfway, checks the timer count stayed at one, then
  cancels a fresh call.
- **ex4** checks the leading call, the collapse to the last suppressed
  arguments, and that an empty window closes without leaving a timer.
- **ex5** drives one success (four checks) and one timeout, then advances a
  further second to prove the polling stopped.
- **ex6** runs virtual time with a tie, a gap, a callback that schedules more
  work, and a backwards jump.
- **ex7** makes the handler burn 30ms and then checks the next tick is 70ms
  away, then makes one overrun the whole interval.
- **ex8** counts timers at every step, fires two deadlines in one advance,
  cancels the earliest, and checks an insertion-order tie.

Next: **d05_promise_basics**, the state machine underneath all of this.
