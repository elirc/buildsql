// Gate for node/04_events_errors. Quoted verbatim in README.md.
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
