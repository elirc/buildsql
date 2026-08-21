# i2 — Interview drills

Six tasks, one take-home, and a review. Every prompt below is written the way an
interviewer would say it out loud, with the time box they would have in mind.

The point of a live-coding round is rarely the code. Interviewers are watching
for four things: whether you ask about the edge cases *before* writing, whether
you type the signature before the body, whether you narrate what you are doing,
and whether you notice your own bug before they mention it. So do these under
the clock, out loud, in one pass — then read the reading, which is written as
the debrief an interviewer would give you.

If a drill runs over its time box, finish it anyway and note which part cost you
the time. That note is more useful than the finished function.

## Drill 1 — groupBy (5 minutes)

> "Quick warm-up. Write me a `groupBy` — takes a list and a function that
> produces a key, gives me back an object of buckets. Keep the input order
> inside each bucket."

Edit `ex1/solution.ts`.

- `groupBy(learners, (l) => l.track)` →
  `{ ts: [Ada, Grace], node: [Eli] }`
- `groupBy([], ...)` → `{}`
- `groupBy([0, 1, 2, 3], (n) => n % 2 === 0 ? "even" : "odd")` →
  `{ even: [0, 2], odd: [1, 3] }`

The generic signature is what is being marked, not the loop.

```
uv run dojo test typescript i2_interview_drills ex1
```

## Drill 2 — a typed event emitter (10 minutes)

> "Here is an interface mapping event names to payload shapes. Give me an
> emitter where `on` and `emit` are typed against it — so emitting `pass` with a
> `fail` payload is a compile error. `on` should return an unsubscribe
> function."

Edit `ex2/solution.ts`.

- handlers only hear their own event, in registration order
- `on(...)` returns an unsubscribe function that really unsubscribes
- emitting an event with no handlers is a no-op, not a crash
- `emitter.emit("skip", ...)` and a wrong payload must not compile

This is the most-asked TypeScript design question in the industry. Get the two
signatures right first; the bodies are five lines each.

```
uv run dojo test typescript i2_interview_drills ex2
```

## Drill 3 — promisify (5 minutes)

> "Old error-first callback API. Give me a `promisify` that wraps it — and while
> you are there, write the *type* that converts the callback signature into the
> promise one."

Edit `ex3/solution.ts`.

- `promisify(succeed)()` resolves with the callback's value
- `promisify(fail)()` rejects with the callback's error
- `Promisified<(callback: Callback<number>) => void>` is `() => Promise<number>`

The type half needs a conditional type with `infer`.

```
uv run dojo test typescript i2_interview_drills ex3
```

## Drill 4 — debounce (10 minutes)

> "Implement `debounce`. After a burst of calls it should run once, `waitMs`
> after the last one, with that last call's arguments. And the wrapper should
> have the same parameter types as the function it wraps."

Edit `ex4/solution.ts`.

- three calls in a burst → the function runs **once**, with the last arguments
- nothing has run at `waitMs - 1`
- a later burst starts a fresh window
- `debounced(1, "two")` must not compile when the wrapped function takes
  `(string, number)`

The gate uses fake timers, so your implementation must use `setTimeout` /
`clearTimeout` rather than dates.

```
uv run dojo test typescript i2_interview_drills ex4
```

## Drill 5 — flatten a comment tree (10 minutes)

> "We render comments as a flat list with indentation. Take the nested tree and
> give me a flat array, each item with its depth. Order matters — a parent before
> its children."

Edit `ex5/solution.ts`.

```ts
flattenTree([
  { id: "a", children: [{ id: "a1", children: [{ id: "a1x" }] }, { id: "a2" }] },
  { id: "b" },
]);
// [ {id:"a",depth:0}, {id:"a1",depth:1}, {id:"a1x",depth:2}, {id:"a2",depth:1}, {id:"b",depth:0} ]
```

`children` is optional. An empty forest flattens to `[]`.

```
uv run dojo test typescript i2_interview_drills ex5
```

## Drill 6 — type a `pipe` (10 minutes)

> "Type this for me: `pipe(value, f, g, h)` applies the functions left to right,
> and the result type should follow the chain. Support up to three functions."

Edit `ex6/solution.ts`.

- `pipe(2, double)` → `4`, typed `number`
- `pipe(2, double, label)` → `"n=4"`, typed `string`
- `pipe(2, double, label, shout)` → `"N=4"`
- `pipe(2, label, double)` must not compile — `label` produces a string and
  `double` takes a number

One implementation, several overload signatures.

```
uv run dojo test typescript i2_interview_drills ex6
```

## Challenge — the 45-minute take-home: a typed store (hard)

> "Build me a tiny state container — the kind a small app would use instead of
> Redux. `getState`, `setState`, `subscribe`, `select`. Generic in the state
> type. Take your time; I care more about the API than about how much you
> finish."

Edit `challenge/solution.ts`. Finish the `Store<S>` interface and implement
`createStore`:

1. `getState()` returns the current state.
2. `setState(next)` accepts either a new state **or** an updater function
   `(current) => next`.
3. `subscribe(listener)` registers a listener called with the new state on every
   change, and returns an unsubscribe function.
4. Setting the state to the value it already holds notifies **nobody** — compare
   with `Object.is`.
5. `select(selector)` applies a selector to the current state and returns its
   result, typed.

Honest difficulty note: the `setState` overload is where the typing gets
awkward, because `typeof updater === "function"` cannot narrow a generic `S`
that might itself be a function. One documented cast is the accepted answer.

```
uv run dojo test typescript i2_interview_drills challenge
```

## Review — mapValues (5 minutes)

> "Same keys, new values. Write `mapValues`."

Edit `review1/solution.ts`.

```ts
mapValues({ a: 1, b: 2 }, (v) => v * 10);        // { a: 10, b: 20 }
mapValues({ a: 1, b: 2 }, (v, k) => `${k}=${v}`); // { a: "a=1", b: "b=2" }
mapValues({}, (v) => v);                          // {}
```

The result type is `Record<keyof T, U>`.

```
uv run dojo test typescript i2_interview_drills review1
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
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
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
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
```

In plain English:

- **ex1** checks two groupings and the empty case; the type gate proves the
  element type survives and that a non-string key is rejected.
- **ex2** checks isolation between events, the unsubscribe function, the
  no-handlers no-op, and two handlers firing in order. The type gate reads each
  handler's payload type from inside the callback and rejects a wrong event name
  and a wrong payload.
- **ex3** checks a resolve and a reject, then compares `Promisified<F>` against
  the promise signature it should produce.
- **ex4** uses fake timers to check nothing fires early, exactly one call fires,
  it fires with the *last* arguments, and a second burst starts fresh.
- **ex5** checks pre-order traversal with depths, the empty forest, and a leaf
  with no `children` property.
- **ex6** checks all three arities and proves a mismatched chain is a compile
  error.
- **challenge** checks reads, both `setState` forms, notification, the
  `Object.is` no-op, unsubscribe and `select`.
- **review1** checks values, the key argument and the empty object.

## The teaching point

Every one of these is a real question that real teams ask, and none of them is
about cleverness. `groupBy` is asked to see whether you reach for a generic;
the emitter to see whether you know `keyof` and indexed access; `debounce` to
see whether you understand closures and timers; `pipe` to see whether you know
what overloads are for; the store to see how you design an API when nobody is
telling you the shape.

The most common failure in this round is silence. Say what you are about to
write ("I will type the signature first — a generic `T` for the elements and a
key function returning a string"), say what you decided ("first occurrence wins;
I would document that"), and say what you would do with more time ("I would add
a `cancel` to the debounce and take a comparator in the store"). Interviewers
cannot mark what they did not hear.

Next: **i3_interview_rapidfire**, which brings the ⭐⭐⭐ concepts back one more
time in fresh form — and, through `dojo review`, keeps bringing them back.
