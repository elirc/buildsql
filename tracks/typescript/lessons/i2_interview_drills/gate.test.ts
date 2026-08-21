// Gate for typescript/i2_interview_drills. Quoted verbatim in README.md.
import { afterEach, describe, expect, test, vi } from "vitest";

import { groupBy } from "./ex1/solution";
import { Emitter } from "./ex2/solution";
import { promisify } from "./ex3/solution";
import { debounce } from "./ex4/solution";
import { flattenTree } from "./ex5/solution";
import { pipe } from "./ex6/solution";
import { createStore } from "./challenge/solution";
import { mapValues } from "./review1/solution";

afterEach(() => {
  vi.useRealTimers();
});

describe("i2_interview_drills", () => {
  test("ex1 - groupBy() buckets items by a computed key", () => {
    const learners = [
      { name: "Ada", track: "ts" },
      { name: "Eli", track: "node" },
      { name: "Grace", track: "ts" },
    ];
    expect(
      groupBy(learners, (learner) => learner.track),
      "two buckets, each in input order",
    ).toEqual({
      ts: [
        { name: "Ada", track: "ts" },
        { name: "Grace", track: "ts" },
      ],
      node: [{ name: "Eli", track: "node" }],
    });
    expect(groupBy([], (x) => String(x)), "no items means no buckets").toEqual({});
    expect(
      groupBy([0, 1, 2, 3], (n) => (n % 2 === 0 ? "even" : "odd")),
      "the key function decides the buckets, not the values",
    ).toEqual({ even: [0, 2], odd: [1, 3] });
  });

  test("ex2 - Emitter dispatches to the right handlers", () => {
    const emitter = new Emitter();
    const passes: string[] = [];
    const fails: string[] = [];
    emitter.on("pass", (payload) => passes.push(payload.exercise));
    const off = emitter.on("fail", (payload) => fails.push(`${payload.exercise}:${payload.message}`));

    emitter.emit("pass", { exercise: "ex1" });
    emitter.emit("fail", { exercise: "ex2", message: "red" });
    expect(passes, "only the pass handler saw the pass event").toEqual(["ex1"]);
    expect(fails, "and only the fail handler saw the fail event").toEqual(["ex2:red"]);

    off();
    emitter.emit("fail", { exercise: "ex3", message: "red again" });
    expect(fails, "on() returns an unsubscribe function, and it has to work").toEqual(["ex2:red"]);

    expect(
      () => emitter.emit("pass", { exercise: "ex9" }),
      "emitting an event with no handlers is a no-op, not a crash",
    ).not.toThrow();

    const second = new Emitter();
    const seen: string[] = [];
    second.on("pass", (p) => seen.push(`a:${p.exercise}`));
    second.on("pass", (p) => seen.push(`b:${p.exercise}`));
    second.emit("pass", { exercise: "ex4" });
    expect(seen, "two handlers on one event both run, in registration order").toEqual([
      "a:ex4",
      "b:ex4",
    ]);
  });

  test("ex3 - promisify() bridges an error-first callback", async () => {
    const succeed = (cb: (error: Error | null, value?: string) => void) => cb(null, "ok");
    const fail = (cb: (error: Error | null, value?: string) => void) => cb(new Error("nope"));

    await expect(promisify(succeed)(), "a null error resolves with the value").resolves.toBe("ok");
    await expect(
      promisify(fail)(),
      "a non-null error rejects with that error, not with undefined",
    ).rejects.toThrow("nope");
  });

  test("ex4 - debounce() runs once, after the last call", () => {
    vi.useFakeTimers();
    const spy = vi.fn((label: string) => label);
    const debounced = debounce(spy, 100);

    debounced("a");
    debounced("b");
    debounced("c");
    expect(spy, "nothing has run yet - the wait has not elapsed").not.toHaveBeenCalled();

    vi.advanceTimersByTime(99);
    expect(spy, "still nothing at 99ms").not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(spy, "exactly one call after the burst, not three").toHaveBeenCalledTimes(1);
    expect(
      spy,
      "and it is the LAST arguments that win - earlier timers were cancelled",
    ).toHaveBeenCalledWith("c");

    debounced("d");
    vi.advanceTimersByTime(100);
    expect(spy, "a later burst starts a fresh window").toHaveBeenCalledTimes(2);
  });

  test("ex5 - flattenTree() walks depth-first with depths", () => {
    const roots = [
      { id: "a", children: [{ id: "a1", children: [{ id: "a1x" }] }, { id: "a2" }] },
      { id: "b" },
    ];
    expect(
      flattenTree(roots),
      "pre-order depth-first: a parent comes before its children, and a subtree " +
        "finishes before the next sibling starts",
    ).toEqual([
      { id: "a", depth: 0 },
      { id: "a1", depth: 1 },
      { id: "a1x", depth: 2 },
      { id: "a2", depth: 1 },
      { id: "b", depth: 0 },
    ]);
    expect(flattenTree([]), "an empty forest flattens to nothing").toEqual([]);
    expect(
      flattenTree([{ id: "leaf" }]),
      "a node with no children property at all is depth 0 and no recursion",
    ).toEqual([{ id: "leaf", depth: 0 }]);
  });

  test("ex6 - pipe() threads a value through the functions", () => {
    const double = (n: number) => n * 2;
    const label = (n: number) => `n=${n}`;
    const shout = (s: string) => s.toUpperCase();

    expect(pipe(2, double), "one function: 2 doubled is 4").toBe(4);
    expect(pipe(2, double, label), "two functions, left to right: 'n=4'").toBe("n=4");
    expect(pipe(2, double, label, shout), "three functions: 'N=4'").toBe("N=4");
  });

  test("challenge - createStore() reads, writes, notifies and unsubscribes", () => {
    const store = createStore({ count: 0, label: "start" });
    expect(store.getState(), "the initial state is what you passed in").toEqual({
      count: 0,
      label: "start",
    });

    const seen: number[] = [];
    const unsubscribe = store.subscribe((state) => seen.push(state.count));

    store.setState({ count: 1, label: "one" });
    expect(store.getState().count, "a plain value replaces the state").toBe(1);

    store.setState((current) => ({ ...current, count: current.count + 1 }));
    expect(store.getState().count, "an updater function receives the current state").toBe(2);
    expect(seen, "each real change notifies every listener once").toEqual([1, 2]);

    const same = store.getState();
    store.setState(same);
    expect(
      seen,
      "setting the state to the value it already has must NOT notify - that no-op " +
        "is what stops render storms (README challenge)",
    ).toEqual([1, 2]);

    unsubscribe();
    store.setState({ count: 9, label: "nine" });
    expect(seen, "an unsubscribed listener hears nothing more").toEqual([1, 2]);
    expect(store.getState().count, "but the state still changed").toBe(9);
    expect(
      store.select((state) => state.label),
      "select() applies a selector to the current state",
    ).toBe("nine");
  });

  test("review1 - mapValues() keeps the keys and replaces the values", () => {
    expect(
      mapValues({ a: 1, b: 2 }, (value) => value * 10),
      "same keys, transformed values",
    ).toEqual({ a: 10, b: 20 });
    expect(
      mapValues({ a: 1, b: 2 }, (value, key) => `${key}=${value}`),
      "the transform's second argument is the key",
    ).toEqual({ a: "a=1", b: "b=2" });
    expect(mapValues({}, (value) => value), "an empty object maps to an empty object").toEqual({});
  });
});
