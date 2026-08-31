# d24 - Mixed gauntlet (drill set)

The last set, and the cumulative one: every exercise combines two or three
topics from across the track, and none of them tells you which. Guards with
generics, a frozen table with indexed access, mapped types with conditionals,
template literals with `infer`, `unknown` with a discriminated union, async with
generics, exhaustiveness with immutability - and a recursive variadic pipeline to
finish.

Both gates run. If a problem here feels like guessing, the topic it is testing is
named in `reading.md` for that exercise, and the drill set that covers it is
named there too - go back to it rather than pushing through.

## ex1 - guards plus generics

`firstMatching(values, guard)` returns the first element the guard accepts, or
`undefined`, and its return type is the **narrowed** type - `S | undefined`,
not `T | undefined`.

- `firstMatching([1, 2, "target", 3, "other"], isString)` -> `"target"`
- no match, or an empty list -> `undefined`
- it stops at the first match: for the list above the guard runs three times

Two type parameters, `T` and `S extends T`, and the guard is
`(value: T) => value is S`.

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d24_mixed_gauntlet ex1
```

## ex2 - a frozen table, read three ways

`RANKS` is `{ bronze: 1, silver: 2, gold: 3 }`, frozen and checked against
`Record<string, number>`. Three things come out of it:

- `RankName` -> `"bronze" | "silver" | "gold"`
- `RankValue` -> `1 | 2 | 3`
- `isHigher(a, b)` -> whether `a` outranks `b`, strictly: `isHigher("gold", "gold")`
  is `false`
- `namesAbove(name)` -> every rank above it, **ascending by value**

`namesAbove("bronze")` is `["silver", "gold"]`, and `namesAbove("gold")` is
`[]`. `isHigher("platinum", "gold")` is a compile error.

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d24_mixed_gauntlet ex2
```

## ex3 - a mapped type with a condition in it

`Stringified<T>` rewrites every member whose type is `number` to `string`, and
leaves everything else alone:

- `Stringified<{ a: number; b: boolean }>` -> `{ a: string; b: boolean }`
- `Stringified<{ nested: { a: number } }>` -> unchanged; only the top level is
  rewritten

`stringifyNumbers(value)` does the same at runtime and returns
`Stringified<T>`.

- `stringifyNumbers({ a: 1, b: "x", c: true })` -> `{ a: "1", b: "x", c: true }`
- `stringifyNumbers({ n: 0 })` -> `{ n: "0" }` - zero is a number like any other

The type is already applied to the function's return; making it do something is
the exercise.

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d24_mixed_gauntlet ex3
```

## ex4 - split a literal, at both levels

`EventOf<S>` splits an event name at its **first** colon:

- `EventOf<"user:created">` -> `{ scope: "user"; name: "created" }`
- `EventOf<"a:b:c">` -> `{ scope: "a"; name: "b:c" }`
- `EventOf<"plain">` -> `never`

`splitEvent(event)` does the same at runtime and returns `EventOf<S>`, so
`splitEvent("order:paid")` is typed `{ scope: "order"; name: "paid" }`. A string
with no colon throws, and the message contains the word `colon`.

The argument has to be a string *literal* for any of this to be worth anything -
`EventOf<string>` is `never`, because `string` does not match the pattern.

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d24_mixed_gauntlet ex4
```

## ex5 - unknown in, a union out

`Command` is the union

```ts
{ type: "add"; item: string } | { type: "remove"; id: number } | { type: "clear" }
```

`parseCommand(input: unknown)` returns a `Command` when the input is one, and
`null` otherwise.

- `{ type: "add", item: "milk" }` -> the add command
- `{ type: "add" }` -> `null`, `{ type: "remove", id: "3" }` -> `null`
- `{ type: "reset" }` -> `null`
- `null`, `[]` and `"clear"` -> `null`

The returned object is rebuilt, not passed through, so nothing extra rides along
with it.

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d24_mixed_gauntlet ex5
```

## ex6 - async plus generics

`firstSuccess(tasks)` calls the task factories **in order** and resolves with
the first one that succeeds.

- `[fail, win, win]` -> the second task's value, and the third is never called
- when every task rejects, the **last** rejection is what comes out
- an empty list rejects with an error whose message contains `no tasks`

The return type is `Promise<T>`, where `T` comes from the tasks.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d24_mixed_gauntlet ex6
```

## ex7 - an exhaustive, immutable reducer

`CartState` is `{ readonly lines: readonly { readonly sku: string; readonly qty: number }[] }`,
and `CartEvent` is

```ts
{ type: "added"; sku: string; qty: number }
  | { type: "removed"; sku: string }
  | { type: "quantity"; sku: string; qty: number }
  | { type: "cleared" }
```

`reduceCart(state, event)` returns a **new** state:

- `added` with a new sku appends `{ sku, qty }`; with an existing sku it adds to
  that line's quantity, **in place** in the list
- `removed` drops the line with that sku; an absent sku is a no-op
- `quantity` sets the quantity; a quantity of `0` or less **removes** the line;
  an unknown sku is a no-op
- `cleared` empties the list

The input state is never modified. `assertNever(value: never): never` throws
with the value in its message, and the `default` branch of the switch calls it.

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d24_mixed_gauntlet ex7
```

## ex8 - the pipeline, typed all the way through

The finale.

`PipeResult<T, Fns>` walks a tuple of step functions and reports the type the
last one produces, awaiting each result along the way:

- `PipeResult<number, [(value: number) => string]>` -> `string`
- `PipeResult<number, [(value: number) => string, (value: string) => boolean]>` -> `boolean`
- `PipeResult<number, [(value: number) => Promise<string>]>` -> `string`

`pipeAsync(input, ...steps)` runs the steps in order, awaiting each one, and
resolves with `PipeResult<T, Fns>`:

- `pipeAsync(2, (n: number) => n + 1, async (n: number) => String(n), (s: string) => s + "!")`
  resolves with `"3!"`, and the three steps run in order
- `pipeAsync("untouched")` resolves with `"untouched"` - no steps, no change
- a step that throws rejects the pipeline

The steps are a rest parameter constrained to `readonly ((arg: never) => unknown)[]`,
which accepts a function of any parameter type.

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d24_mixed_gauntlet ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Runtime gate for typescript/d24_mixed_gauntlet. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { firstMatching } from "./ex1/solution";
import { isHigher, namesAbove, RANKS } from "./ex2/solution";
import { stringifyNumbers } from "./ex3/solution";
import { splitEvent } from "./ex4/solution";
import { parseCommand } from "./ex5/solution";
import { firstSuccess } from "./ex6/solution";
import type { CartState } from "./ex7/solution";
import { assertNever, reduceCart } from "./ex7/solution";
import { pipeAsync } from "./ex8/solution";

const isString = (value: unknown): value is string => typeof value === "string";

const empty: CartState = { lines: [] };

describe("d24_mixed_gauntlet", () => {
  test("ex1 - firstMatching() returns the first value the guard accepts", () => {
    const mixed: (string | number)[] = [1, 2, "target", 3, "other"];
    expect(firstMatching(mixed, isString), "the first string, not the last").toBe("target");
    expect(firstMatching([1, 2], isString), "no match is undefined, not null").toBe(undefined);
    expect(firstMatching([], isString), "and an empty list is undefined too").toBe(undefined);
    let calls = 0;
    firstMatching(mixed, (value): value is string => {
      calls += 1;
      return typeof value === "string";
    });
    expect(calls, "it stops at the first match - three values examined, not five").toBe(3);
  });

  test("ex2 - the rank table decides the order", () => {
    expect(RANKS.gold, "the table still holds its numbers").toBe(3);
    expect(isHigher("gold", "silver"), "gold outranks silver").toBe(true);
    expect(isHigher("silver", "gold"), "and not the other way round").toBe(false);
    expect(isHigher("gold", "gold"), "a rank does not outrank itself").toBe(false);
    expect(namesAbove("silver"), "everything above silver, in ascending order").toEqual(["gold"]);
    expect(namesAbove("bronze"), "two ranks above bronze, ascending").toEqual([
      "silver",
      "gold",
    ]);
    expect(namesAbove("gold"), "nothing is above the top rank").toEqual([]);
  });

  test("ex3 - stringifyNumbers() converts only the numbers", () => {
    expect(
      stringifyNumbers({ a: 1, b: "x", c: true }),
      "numbers become strings and everything else is left alone",
    ).toEqual({ a: "1", b: "x", c: true });
    expect(stringifyNumbers({}), "an empty object stays empty").toEqual({});
    expect(stringifyNumbers({ n: 0 }), "zero converts like any other number").toEqual({ n: "0" });
    expect(stringifyNumbers({ n: -1.5 }), "and so does a negative decimal").toEqual({ n: "-1.5" });
  });

  test("ex4 - splitEvent() cuts at the first colon", () => {
    expect(splitEvent("user:created"), "scope before the colon, name after").toEqual({
      scope: "user",
      name: "created",
    });
    expect(splitEvent("a:b:c"), "only the first colon is the separator - the rest belongs " +
      "to the name, which is what the type says too (README ex4)").toEqual({
      scope: "a",
      name: "b:c",
    });
    expect(() => splitEvent("plain"), "a string with no colon is not an event").toThrow(/colon/);
  });

  test("ex5 - parseCommand() accepts three shapes and nothing else", () => {
    expect(parseCommand({ type: "add", item: "milk" }), "a valid add").toEqual({
      type: "add",
      item: "milk",
    });
    expect(parseCommand({ type: "remove", id: 3 }), "a valid remove").toEqual({
      type: "remove",
      id: 3,
    });
    expect(parseCommand({ type: "clear" }), "clear carries nothing else").toEqual({
      type: "clear",
    });
    expect(parseCommand({ type: "add" }), "an add with no item is not an add").toBe(null);
    expect(parseCommand({ type: "remove", id: "3" }), "an id has to be a number").toBe(null);
    expect(parseCommand({ type: "reset" }), "an unknown type is null").toBe(null);
    expect(parseCommand(null), "null is not a command - and typeof null is object, which " +
      "is why the check has to be explicit (README ex5)").toBe(null);
    expect(parseCommand([]), "an array is not a command either").toBe(null);
    expect(parseCommand("clear"), "and neither is the bare string").toBe(null);
  });

  test("ex6 - firstSuccess() tries in order and stops at the first win", async () => {
    const log: string[] = [];
    const fail = (name: string) => async (): Promise<string> => {
      log.push(name);
      throw new Error("failed " + name);
    };
    const win = (name: string) => async (): Promise<string> => {
      log.push(name);
      return name;
    };
    expect(await firstSuccess([fail("a"), win("b"), win("c")]), "the second task wins").toBe("b");
    expect(log, "and the third is never called").toEqual(["a", "b"]);

    await expect(
      firstSuccess([fail("x"), fail("y")]),
      "when everything fails the last error is what comes out",
    ).rejects.toThrow(/failed y/);

    await expect(
      firstSuccess<string>([]),
      "an empty list has no success to report and no error to rethrow, so it needs its own",
    ).rejects.toThrow(/no tasks/);
  });

  test("ex7 - reduceCart() rebuilds the state instead of editing it", () => {
    const one = reduceCart(empty, { type: "added", sku: "a", qty: 2 });
    expect(one.lines, "a new sku is appended").toEqual([{ sku: "a", qty: 2 }]);
    expect(empty.lines, "and the state it came from is untouched").toEqual([]);

    const more = reduceCart(one, { type: "added", sku: "a", qty: 3 });
    expect(more.lines, "adding an existing sku sums the quantities in place").toEqual([
      { sku: "a", qty: 5 },
    ]);

    const two = reduceCart(more, { type: "added", sku: "b", qty: 1 });
    expect(two.lines.map((line) => line.sku), "a second sku goes on the end").toEqual(["a", "b"]);

    expect(
      reduceCart(two, { type: "quantity", sku: "a", qty: 1 }).lines,
      "quantity sets rather than adds",
    ).toEqual([
      { sku: "a", qty: 1 },
      { sku: "b", qty: 1 },
    ]);
    expect(
      reduceCart(two, { type: "quantity", sku: "a", qty: 0 }).lines,
      "a quantity of zero removes the line - a cart with zero of something is a bug " +
        "waiting to be printed on an invoice (README ex7)",
    ).toEqual([{ sku: "b", qty: 1 }]);
    expect(
      reduceCart(two, { type: "quantity", sku: "zz", qty: 4 }).lines,
      "quantity on an unknown sku changes nothing",
    ).toEqual([
      { sku: "a", qty: 5 },
      { sku: "b", qty: 1 },
    ]);
    expect(reduceCart(two, { type: "removed", sku: "a" }).lines, "removed drops one line").toEqual(
      [{ sku: "b", qty: 1 }],
    );
    expect(
      reduceCart(two, { type: "removed", sku: "zz" }).lines,
      "removing an absent sku is a no-op, not an error",
    ).toEqual([
      { sku: "a", qty: 5 },
      { sku: "b", qty: 1 },
    ]);
    expect(reduceCart(two, { type: "cleared" }).lines, "cleared empties the cart").toEqual([]);
    expect(() => assertNever("added" as never), "and the unreachable branch names what it " +
      "was handed").toThrow(/added/);
  });

  test("ex8 - pipeAsync() feeds each step into the next", async () => {
    const log: string[] = [];
    const result = await pipeAsync(
      2,
      (value: number) => {
        log.push("one");
        return value + 1;
      },
      async (value: number) => {
        log.push("two");
        return String(value);
      },
      (value: string) => {
        log.push("three");
        return value + "!";
      },
    );
    expect(result, "each step receives what the one before it produced").toBe("3!");
    expect(log, "and they run in order, one at a time").toEqual(["one", "two", "three"]);
    expect(await pipeAsync("untouched"), "no steps means the input comes straight back").toBe(
      "untouched",
    );
    await expect(
      pipeAsync(1, () => {
        throw new Error("step blew up");
      }),
      "a step that throws rejects the pipeline",
    ).rejects.toThrow(/step blew up/);
  });
});
```

This is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/d24_mixed_gauntlet. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { firstMatching } from "./ex1/solution";
import type { RankName, RankValue } from "./ex2/solution";
import { isHigher, namesAbove } from "./ex2/solution";
import type { Stringified } from "./ex3/solution";
import { stringifyNumbers } from "./ex3/solution";
import type { EventOf } from "./ex4/solution";
import { splitEvent } from "./ex4/solution";
import type { Command } from "./ex5/solution";
import { parseCommand } from "./ex5/solution";
import { firstSuccess } from "./ex6/solution";
import type { CartState } from "./ex7/solution";
import { assertNever, reduceCart } from "./ex7/solution";
import type { PipeResult } from "./ex8/solution";
import { pipeAsync } from "./ex8/solution";

const isString = (value: unknown): value is string => typeof value === "string";

describe("d24_mixed_gauntlet", () => {
  test("ex1 - firstMatching() returns the narrowed type or undefined", () => {
    const mixed: (string | number)[] = [];
    expectTypeOf(firstMatching(mixed, isString)).toEqualTypeOf<string | undefined>();
    const rows: unknown[] = [];
    expectTypeOf(
      firstMatching(rows, (value): value is { id: string } => typeof value === "object"),
    ).toEqualTypeOf<{ id: string } | undefined>();
  });

  test("ex2 - the rank names and values are literal unions", () => {
    expectTypeOf<RankName>().toEqualTypeOf<"bronze" | "silver" | "gold">();
    expectTypeOf<RankValue>().toEqualTypeOf<1 | 2 | 3>();
    expectTypeOf(namesAbove("bronze")).toEqualTypeOf<RankName[]>();
    // @ts-expect-error - platinum is not a rank.
    isHigher("platinum", "gold");
  });

  test("ex3 - Stringified<T> rewrites the number members only", () => {
    expectTypeOf<Stringified<{ a: number; b: boolean }>>().toEqualTypeOf<{
      a: string;
      b: boolean;
    }>();
    expectTypeOf(stringifyNumbers({ a: 1, b: "x" })).toEqualTypeOf<{ a: string; b: string }>();
    expectTypeOf<Stringified<{ nested: { a: number } }>>().toEqualTypeOf<{
      nested: { a: number };
    }>();
  });

  test("ex4 - EventOf splits a literal at the type level too", () => {
    expectTypeOf<EventOf<"user:created">>().toEqualTypeOf<{ scope: "user"; name: "created" }>();
    expectTypeOf<EventOf<"a:b:c">>().toEqualTypeOf<{ scope: "a"; name: "b:c" }>();
    expectTypeOf<EventOf<"plain">>().toEqualTypeOf<never>();
    expectTypeOf(splitEvent("order:paid")).toEqualTypeOf<{ scope: "order"; name: "paid" }>();
  });

  test("ex5 - parseCommand() hands back a narrowable union", () => {
    expectTypeOf(parseCommand({})).toEqualTypeOf<Command | null>();
    const command = parseCommand({ type: "add", item: "milk" });
    if (command !== null && command.type === "add") {
      expectTypeOf(command.item).toEqualTypeOf<string>();
    }
    if (command !== null && command.type === "remove") {
      expectTypeOf(command.id).toEqualTypeOf<number>();
    }
  });

  test("ex6 - firstSuccess() resolves with the tasks own type", async () => {
    expectTypeOf(firstSuccess([async () => "a"])).toEqualTypeOf<Promise<string>>();
    expectTypeOf(await firstSuccess([async () => 1])).toEqualTypeOf<number>();
  });

  test("ex7 - the cart state is readonly and the switch is total", () => {
    const state: CartState = { lines: [] };
    expectTypeOf(reduceCart(state, { type: "cleared" })).toEqualTypeOf<CartState>();
    expectTypeOf(state.lines[0]).toEqualTypeOf<{ readonly sku: string; readonly qty: number }>();
    // @ts-expect-error - the lines of a cart state cannot be replaced.
    state.lines = [];
    // @ts-expect-error - assertNever only accepts a value that cannot exist.
    assertNever("added");
  });

  test("ex8 - PipeResult walks the steps and reports the last type", async () => {
    expectTypeOf<PipeResult<number, [(value: number) => string]>>().toEqualTypeOf<string>();
    expectTypeOf<
      PipeResult<number, [(value: number) => string, (value: string) => boolean]>
    >().toEqualTypeOf<boolean>();
    expectTypeOf<PipeResult<number, [(value: number) => Promise<string>]>>().toEqualTypeOf<string>();
    expectTypeOf(
      pipeAsync(
        2,
        (value: number) => value + 1,
        async (value: number) => String(value),
      ),
    ).toEqualTypeOf<Promise<string>>();
  });
});
```

An exercise is green only when both gates agree about it.
