// Type gate for typescript/i2_interview_drills. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { groupBy } from "./ex1/solution";
import { Emitter } from "./ex2/solution";
import type { Callback, Promisified } from "./ex3/solution";
import { promisify } from "./ex3/solution";
import { debounce } from "./ex4/solution";
import type { FlatNode } from "./ex5/solution";
import { flattenTree } from "./ex5/solution";
import { pipe } from "./ex6/solution";
import { createStore } from "./challenge/solution";
import { mapValues } from "./review1/solution";

interface Learner {
  name: string;
  track: string;
}

describe("i2_interview_drills", () => {
  test("ex1 - groupBy() keeps the element type", () => {
    const learners: Learner[] = [{ name: "Ada", track: "ts" }];
    expectTypeOf(groupBy(learners, (l) => l.track)).toEqualTypeOf<Record<string, Learner[]>>();
    // @ts-expect-error - the key function must produce a string.
    groupBy(learners, (l) => l.name.length);
  });

  test("ex2 - the emitter ties each event to its payload", () => {
    const emitter = new Emitter();
    emitter.on("fail", (payload) => {
      expectTypeOf(payload).toEqualTypeOf<{ exercise: string; message: string }>();
    });
    emitter.on("pass", (payload) => {
      expectTypeOf(payload).toEqualTypeOf<{ exercise: string }>();
    });
    expectTypeOf(emitter.on("pass", () => {})).toEqualTypeOf<() => void>();
    // @ts-expect-error - a pass payload has no message.
    emitter.emit("pass", { exercise: "ex1", message: "no" });
    // @ts-expect-error - "skip" is not an event on the map.
    emitter.emit("skip", { exercise: "ex1" });
  });

  test("ex3 - Promisified<F> converts the signature", () => {
    expectTypeOf<Promisified<(callback: Callback<number>) => void>>().toEqualTypeOf<
      () => Promise<number>
    >();
    expectTypeOf<Promisified<(callback: Callback<string>) => void>>().toEqualTypeOf<
      () => Promise<string>
    >();
    const wrapped = promisify((callback: Callback<boolean>) => callback(null, true));
    expectTypeOf(wrapped()).toEqualTypeOf<Promise<boolean>>();
  });

  test("ex4 - debounce() preserves the wrapped parameters", () => {
    const debounced = debounce((label: string, times: number) => {
      void label;
      void times;
    }, 10);
    expectTypeOf(debounced).parameters.toEqualTypeOf<[label: string, times: number]>();
    expectTypeOf(debounced).returns.toEqualTypeOf<void>();
    // @ts-expect-error - the wrapped function wants (string, number).
    debounced(1, "two");
  });

  test("ex5 - flattenTree() returns flat nodes", () => {
    expectTypeOf(flattenTree([{ id: "a" }])).toEqualTypeOf<FlatNode[]>();
    // @ts-expect-error - a node needs an id.
    flattenTree([{ children: [] }]);
  });

  test("ex6 - pipe() follows the chain", () => {
    const double = (n: number) => n * 2;
    const label = (n: number) => `n=${n}`;
    const shout = (s: string) => s.toUpperCase();
    expectTypeOf(pipe(2, double)).toEqualTypeOf<number>();
    expectTypeOf(pipe(2, double, label)).toEqualTypeOf<string>();
    expectTypeOf(pipe(2, double, label, shout)).toEqualTypeOf<string>();
    // @ts-expect-error - label produces a string, which double cannot take.
    pipe(2, label, double);
  });

  test("challenge - the store is generic in its state", () => {
    const store = createStore({ count: 0, label: "start" });
    expectTypeOf(store.getState()).toEqualTypeOf<{ count: number; label: string }>();
    expectTypeOf(store.select((state) => state.label)).toEqualTypeOf<string>();
    expectTypeOf(store.subscribe(() => {})).toEqualTypeOf<() => void>();
    store.setState((current) => {
      expectTypeOf(current).toEqualTypeOf<{ count: number; label: string }>();
      return current;
    });
    // @ts-expect-error - the state shape is fixed by the initial value.
    store.setState({ count: "nine", label: "nine" });
  });

  test("review1 - mapValues() keeps the keys and changes the values", () => {
    expectTypeOf(mapValues({ a: 1, b: 2 }, (value) => String(value))).toEqualTypeOf<
      Record<"a" | "b", string>
    >();
    expectTypeOf(mapValues({ a: 1 }, (value) => value * 2)).toEqualTypeOf<Record<"a", number>>();
  });
});
