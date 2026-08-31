// Gate for node/d09_emitters. Quoted verbatim in README.md.
//
// Emitters are synchronous, so most of this gate needs no waiting at all. Where
// it does, it hands control back to the loop rather than sleeping; the one
// timed problem runs under fake timers. Listener counts are checked after every
// helper settles, because a listener that outlives its promise is the classic
// Node memory leak.
import { EventEmitter } from "node:events";
import { describe, expect, test, vi } from "vitest";

import { Store } from "./ex1/solution";
import { firstOf } from "./ex2/solution";
import { forward } from "./ex3/solution";
import { createStickyEmitter } from "./ex4/solution";
import { iterateEvents } from "./ex5/solution";
import { createStrictEmitter } from "./ex6/solution";
import { createCoalescingEmitter } from "./ex7/solution";
import { onceWithSignal } from "./ex8/solution";

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

const totalListeners = (emitter: EventEmitter, ...events: string[]): number =>
  events.reduce((sum, event) => sum + emitter.listenerCount(event), 0);

describe("d09_emitters", () => {
  test("ex1 - Store announces what changed and what it used to be", () => {
    const store = new Store();
    expect(store instanceof EventEmitter, "a Store IS an EventEmitter").toBe(true);

    const changes: Array<[string, string, string | undefined]> = [];
    store.on("change", (key: string, value: string, previous: string | undefined) =>
      changes.push([key, value, previous]),
    );

    store.set("region", "eu-west-1");
    expect(
      changes,
      "emit() is SYNCHRONOUS: by the time set() returns the listener has run, " +
        "with the key, the new value, and the old one - which is undefined the " +
        "first time",
    ).toEqual([["region", "eu-west-1", undefined]]);

    store.set("region", "us-east-1");
    expect(
      changes[1],
      "and on the second write the previous value is what was there before",
    ).toEqual(["region", "us-east-1", "eu-west-1"]);

    store.set("region", "us-east-1");
    expect(
      changes.length,
      "writing the same value again is not a change. Emitting anyway is how a " +
        "UI ends up re-rendering on every poll of an unchanged config",
    ).toBe(2);

    const removals: Array<[string, string]> = [];
    store.on("delete", (key: string, value: string) => removals.push([key, value]));

    expect(store.get("region"), "get() returns what was set").toBe("us-east-1");
    expect(store.size(), "one key").toBe(1);

    expect(store.delete("region"), "deleting something that exists reports true").toBe(true);
    expect(removals, "and announces the key with the value it had").toEqual([
      ["region", "us-east-1"],
    ]);
    expect(store.size(), "and the store is empty").toBe(0);

    expect(store.delete("region"), "deleting it again reports false").toBe(false);
    expect(
      removals.length,
      "and says nothing - an event for something that did not happen is worse " +
        "than no event",
    ).toBe(1);
  });

  test("ex2 - firstOf() takes whichever event arrives first and tidies up", async () => {
    const emitter = new EventEmitter();
    const promise = firstOf(emitter, ["done", "cancelled"]);

    emitter.emit("cancelled", "by the user", 42);
    emitter.emit("done", "too late");

    expect(
      await promise,
      "the first of the named events wins, and its arguments come with it",
    ).toEqual({ event: "cancelled", args: ["by the user", 42] });
    expect(
      totalListeners(emitter, "done", "cancelled", "error"),
      "every listener it added is removed once it settles. Listeners that " +
        "outlive their promise are the classic Node leak, and at 11 of them " +
        "Node starts printing MaxListenersExceededWarning",
    ).toBe(0);

    const failing = new EventEmitter();
    const doomed = firstOf(failing, ["done"]);
    doomed.catch(() => {});
    failing.emit("error", new Error("socket hang up"));
    await expect(
      doomed,
      "an error event rejects, even though it was not one of the names asked " +
        "for - an emitter with no error listener at all throws instead, which " +
        "kills the process",
    ).rejects.toThrow("socket hang up");
    expect(
      totalListeners(failing, "done", "error"),
      "and the failure path cleans up too",
    ).toBe(0);
  });

  test("ex3 - forward() re-emits exactly what it was asked to, and can be undone", () => {
    const source = new EventEmitter();
    const target = new EventEmitter();
    const seen: Array<[string, unknown[]]> = [];

    for (const event of ["db:query", "db:close", "ignored"]) {
      target.on(event, (...args: unknown[]) => seen.push([event, args]));
    }
    let ownListenerCalls = 0;
    source.on("query", () => {
      ownListenerCalls += 1;
    });

    const stop = forward(source, target, { events: ["query", "close"], prefix: "db:" });

    source.emit("query", "select 1", 12);
    source.emit("close");
    source.emit("ignored", "nope");

    expect(
      seen,
      "each named event is re-emitted on the target under the prefixed name, " +
        "with the arguments passed through untouched - and an event that was " +
        "not named is not forwarded",
    ).toEqual([
      ["db:query", ["select 1", 12]],
      ["db:close", []],
    ]);
    expect(ownListenerCalls, "the source keeps working normally").toBe(1);

    stop();
    source.emit("query", "select 2");
    expect(seen.length, "after unsubscribing, nothing is forwarded").toBe(2);
    expect(
      source.listenerCount("query"),
      "and only the listener forward() added is gone - the one that was " +
        "already there is untouched. removeAllListeners here would be a very " +
        "rude helper",
    ).toBe(1);

    stop();
    expect(source.listenerCount("query"), "unsubscribing twice is harmless").toBe(1);
  });

  test("ex4 - createStickyEmitter() replays what happened before anybody listened", () => {
    const bus = createStickyEmitter();

    expect(
      bus.emit("ready", 1),
      "with nobody listening the event is kept rather than delivered, and " +
        "emit reports that it went nowhere yet",
    ).toBe(false);
    bus.emit("ready", 2);
    expect(bus.buffered("ready"), "two are waiting").toBe(2);
    expect(bus.buffered("other"), "and nothing on an untouched event").toBe(0);

    const seen: number[] = [];
    bus.on("ready", (value: unknown) => seen.push(value as number));
    expect(
      seen,
      "the first listener gets the backlog immediately, in order, at the " +
        "moment it registers. This is the fix for the race where a component " +
        "subscribes one tick after the thing it cares about has happened",
    ).toEqual([1, 2]);
    expect(bus.buffered("ready"), "and the backlog is spent").toBe(0);

    expect(bus.emit("ready", 3), "now there is a listener, so it is delivered").toBe(true);
    expect(seen, "live").toEqual([1, 2, 3]);

    const late: number[] = [];
    bus.on("ready", (value: unknown) => late.push(value as number));
    expect(
      late,
      "a second listener gets nothing: the backlog was delivered once and is " +
        "gone. Replaying it to everybody forever would be a log, not an emitter",
    ).toEqual([]);

    bus.emit("ready", 4);
    expect(seen, "both listeners now see live events").toEqual([1, 2, 3, 4]);
    expect(late).toEqual([4]);
  });

  test("ex5 - iterateEvents() turns an event into an async iterable", async () => {
    const source = new EventEmitter();
    const seen: string[] = [];
    const consumed = (async () => {
      for await (const value of iterateEvents<string>(source, "data")) seen.push(value);
    })();

    source.emit("data", "a");
    source.emit("data", "b");
    await settle();
    expect(
      seen,
      "two events emitted back to back before the consumer had a chance to " +
        "run: both must be buffered, not dropped",
    ).toEqual(["a", "b"]);

    source.emit("data", "c");
    source.emit("end");
    await consumed;
    expect(seen, "anything queued before end is still delivered").toEqual(["a", "b", "c"]);
    expect(
      totalListeners(source, "data", "end", "error"),
      "and the iterator lets go of the emitter when it finishes",
    ).toBe(0);

    const failing = new EventEmitter();
    const got: string[] = [];
    const errors: string[] = [];
    const ran = (async () => {
      try {
        for await (const value of iterateEvents<string>(failing, "data")) got.push(value);
      } catch (error) {
        errors.push((error as Error).message);
      }
    })();

    failing.emit("data", "x");
    failing.emit("error", new Error("socket hang up"));
    await ran;
    expect(got, "everything already queued arrives before the failure does").toEqual(["x"]);
    expect(errors, "and then the error is thrown into the loop").toEqual(["socket hang up"]);
    expect(
      totalListeners(failing, "data", "end", "error"),
      "the failure path cleans up too",
    ).toBe(0);
  });

  test("ex6 - createStrictEmitter() treats error as the special case it is", () => {
    const bus = createStrictEmitter();
    const seen: string[] = [];

    expect(
      bus.emit("tick", 1),
      "emit returns false when nobody was listening - that is how the real " +
        "EventEmitter tells you an event went nowhere",
    ).toBe(false);

    const listener = (n: unknown) => seen.push(`on:${n as number}`);
    bus.on("tick", listener);
    expect(bus.emit("tick", 1), "and true when somebody was").toBe(true);
    expect(seen, "listeners run synchronously, in registration order").toEqual(["on:1"]);

    bus.once("tick", (n: unknown) => seen.push(`once:${n as number}`));
    expect(bus.listenerCount("tick"), "a once listener counts until it fires").toBe(2);
    bus.emit("tick", 2);
    bus.emit("tick", 3);
    expect(seen, "and fires exactly once").toEqual(["on:1", "on:2", "once:2", "on:3"]);
    expect(bus.listenerCount("tick"), "then it is gone").toBe(1);

    bus.off("tick", listener);
    expect(bus.listenerCount("tick"), "off removes the one you name").toBe(0);

    const boom = new Error("connection reset");
    expect(
      () => bus.emit("error", boom),
      "an error event with no listener THROWS the error rather than vanishing. " +
        "That rule is the reason an unhandled stream error crashes the process " +
        "instead of hanging it",
    ).toThrow(boom);

    const failures: string[] = [];
    bus.once("error", (error: unknown) => failures.push((error as Error).message));
    expect(
      () => bus.emit("error", new Error("first")),
      "with a listener registered it is an ordinary event",
    ).not.toThrow();
    expect(failures).toEqual(["first"]);

    expect(
      () => bus.emit("error", new Error("second")),
      "but that listener was a once, so it has been used up - and the next " +
        "error is unhandled again",
    ).toThrow("second");
  });

  test("ex7 - createCoalescingEmitter() batches a burst into one delivery", () => {
    vi.useFakeTimers();
    try {
      const batches: string[][] = [];
      const emitter = createCoalescingEmitter({ windowMs: 100 });
      emitter.on((batch) => batches.push(batch));

      expect(vi.getTimerCount(), "an idle emitter arms nothing").toBe(0);

      emitter.push("a");
      expect(vi.getTimerCount(), "the first push opens the window").toBe(1);
      vi.advanceTimersByTime(60);
      emitter.push("b");
      expect(
        vi.getTimerCount(),
        "a later push joins the window it found - it does NOT restart it. That " +
          "is the difference from a debounce, and it is what puts a ceiling on " +
          "how long a value can sit unsent",
      ).toBe(1);
      expect(emitter.pending(), "two waiting").toBe(2);
      expect(batches, "and nothing delivered yet").toEqual([]);

      vi.advanceTimersByTime(40);
      expect(
        batches,
        "at 100ms from the FIRST push the whole batch goes out at once, in " +
          "push order",
      ).toEqual([["a", "b"]]);
      expect(emitter.pending(), "the buffer is cleared").toBe(0);
      expect(vi.getTimerCount(), "and the window is closed, not re-armed").toBe(0);

      emitter.push("c");
      emitter.flush();
      expect(batches, "flush() delivers immediately").toEqual([["a", "b"], ["c"]]);
      expect(
        vi.getTimerCount(),
        "and cancels the pending window, or the batch would be delivered twice",
      ).toBe(0);

      emitter.flush();
      vi.advanceTimersByTime(1_000);
      expect(
        batches.length,
        "flushing an empty buffer emits nothing at all - an empty batch is not " +
          "a batch",
      ).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });

  test("ex8 - onceWithSignal() waits for an event or for the caller to give up", async () => {
    const emitter = new EventEmitter();
    const controller = new AbortController();

    const value = onceWithSignal<string>(emitter, "ready", controller.signal);
    expect(emitter.listenerCount("ready"), "one listener while it waits").toBe(1);
    emitter.emit("ready", "here it is");
    expect(await value, "the first argument of the event is the value").toBe("here it is");
    expect(
      emitter.listenerCount("ready"),
      "and the listener is removed once it has fired",
    ).toBe(0);

    const cancelled = new AbortController();
    const abandoned = onceWithSignal<string>(emitter, "ready", cancelled.signal);
    abandoned.catch(() => {});
    expect(emitter.listenerCount("ready"), "waiting again").toBe(1);

    cancelled.abort(new Error("caller gave up"));
    await expect(
      abandoned,
      "aborting rejects with the reason the caller supplied",
    ).rejects.toThrow("caller gave up");
    expect(
      emitter.listenerCount("ready"),
      "and the emitter listener goes with it. Without this every cancelled " +
        "request leaves a listener behind on a long-lived emitter",
    ).toBe(0);

    emitter.emit("ready", "ignored");

    const already = onceWithSignal<string>(emitter, "ready", AbortSignal.abort(new Error("too late")));
    already.catch(() => {});
    await expect(
      already,
      "a signal that is already aborted rejects straight away",
    ).rejects.toThrow("too late");
    expect(
      emitter.listenerCount("ready"),
      "without ever having attached a listener at all",
    ).toBe(0);
  });
});
