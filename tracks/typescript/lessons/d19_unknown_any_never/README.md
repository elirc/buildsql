# d19 - unknown, any and never (drill set)

Eight problems on the three types that are not really types: `unknown` (the
value you have not earned the right to use), `any` (the value that stops the
compiler asking), and `never` (the value that does not exist). They drill
lesson **10_guards_assertions**, whose third exercise made the case for
`unknown`; this set makes it eight times.

Both gates run. `gate.test.ts` checks behaviour and `gate.test-d.ts` checks
what the signature promises - because most of the mistakes in this area are
correct programs with dishonest types. ex5 is type-level only and appears in
the type gate alone.

## ex1 - parse into unknown

`parseJson(text)` parses JSON and returns **`unknown`**, and throws when the
text is not valid JSON.

- `parseJson('{"a":1}')` -> `{ a: 1 }`, `parseJson("null")` -> `null`
- `parseJson("{")` throws

`JSON.parse` is typed as returning `any`, which is the single most common way
`any` gets into a codebase. The exercise is to stop it at the door.

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d19_unknown_any_never ex1
```

## ex2 - unknown in, number or null out

`toNumber(value)` takes an `unknown` and returns `number | null`.

- a **finite** number is itself; `NaN` and `Infinity` are `null`
- a string is trimmed first: `"42"` -> `42`, `"  7  "` -> `7`
- `""` and `"   "` are `null` - **not** `0`
- `"abc"` -> `null`
- booleans, `null`, `undefined` and objects are all `null`

The return type is part of the exercise: the stub declares `unknown`.

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d19_unknown_any_never ex2
```

## ex3 - never as the exhaustiveness check

`Shipment` is the union
`{ status: "pending" } | { status: "shipped"; trackingId: string } | { status: "delivered"; signedBy: string } | { status: "cancelled"; reason: string }`.

`describeShipment(shipment)` returns:

- `"waiting to ship"`, `"in transit as TR9"`, `"delivered to Ada"`,
  `"cancelled: out of stock"`

and its `default` branch calls `assertUnreachable(shipment)`.

`assertUnreachable(value: never): never` throws, and its message contains the
value it was handed. Its parameter type is `never`, so passing anything the
switch did not already narrow away is a **compile error** - which is how a
newly added union member becomes a build failure instead of a runtime
surprise.

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d19_unknown_any_never ex3
```

## ex4 - an untyped store with a typed door

`createCache()` returns an object with three members:

- `set(key: string, value: unknown): void`
- `get<T>(key: string, guard: (value: unknown) => value is T): T | null`
- `has(key: string): boolean`

The store holds `unknown` internally. `get` returns the value only if the
guard accepts it, and `null` otherwise - including when the key is absent.

- `cache.set("count", 3)`, then `cache.get("count", isNumber)` -> `3`
- `cache.get("count", isString)` -> `null` - the guard is the only proof
- `cache.get("missing", isNumber)` -> `null`

The `Cache` interface is exported; the stub's `get` returns `unknown`, which
is what you have to fix.

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d19_unknown_any_never ex4
```

## ex5 - never as a filter

Type-level only, and the one exercise here with no runtime half.

`OmitNever<T>` removes every member whose type is `never`.

- `OmitNever<{ a: string; b: never; c: number }>` -> `{ a: string; c: number }`
- `OmitNever<{ a: string }>` -> `{ a: string }`
- `OmitNever<{ a: never }>` -> an object with no keys
- `OmitNever<{ a: never; b: undefined }>` -> `{ b: undefined }` - `undefined`
  is a value and stays

Members typed `never` show up whenever a conditional type filters something
out, which is why a utility that sweeps them away is worth having.

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d19_unknown_any_never ex5
```

## ex6 - walk a path through unknown

`deepGet(value, path)` follows a list of string keys into an unknown value and
returns whatever it finds - as `unknown`. It returns `undefined` the moment the
path stops working.

- `deepGet({ server: { name: "edge" } }, ["server", "name"])` -> `"edge"`
- `deepGet({ server: { ports: [8080, 9090] } }, ["server", "ports", "1"])` -> `9090`
- `deepGet(config, [])` -> the value itself
- a missing key, a walk into a string, `null` and `undefined` all give `undefined`

Only own properties count.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d19_unknown_any_never ex6
```

## ex7 - narrow unknown to JSON

`JsonValue` is given:

```ts
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
```

`isJsonValue(value)` narrows an `unknown` to it. Accept exactly what JSON can
hold:

- `{ a: [1, "x", null, { b: true }] }` -> `true`, `[]` and `{}` -> `true`
- `null` -> `true`, `undefined` -> `false`
- `NaN` -> `false` - JSON has no spelling for it
- a function -> `false`, and one bad value anywhere fails the whole document

The guard has to recurse.

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d19_unknown_any_never ex7
```

## ex8 - a function that never returns

Two exports.

`fail(message: string): never` throws an `Error` with that message. Because it
returns `never`, the compiler treats any code after a call to it as
unreachable - which means it can be used as the last expression of a function
that is declared to return something else, and as the `else` of a ternary.

`requirePort(raw: unknown): number` returns a valid port, or calls `fail`. A
valid port is an integer from 1 to 65535; a numeric string is accepted after
trimming. The thrown message contains the word `port`.

- `requirePort(8080)` -> `8080`, `requirePort("443")` -> `443`, `requirePort("  22  ")` -> `22`
- `requirePort(0)`, `requirePort(70000)`, `requirePort(80.5)`, `requirePort("abc")`
  and `requirePort(null)` all throw

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d19_unknown_any_never ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Runtime gate for typescript/d19_unknown_any_never. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { parseJson } from "./ex1/solution";
import { toNumber } from "./ex2/solution";
import { assertUnreachable, describeShipment } from "./ex3/solution";
import { createCache } from "./ex4/solution";
import { deepGet } from "./ex6/solution";
import { isJsonValue } from "./ex7/solution";
import { fail, requirePort } from "./ex8/solution";

const isNumber = (value: unknown): value is number => typeof value === "number";
const isString = (value: unknown): value is string => typeof value === "string";

describe("d19_unknown_any_never", () => {
  test("ex1 - parseJson() parses or throws", () => {
    expect(parseJson('{"a":1}'), "a valid object round-trips").toEqual({ a: 1 });
    expect(parseJson("null"), "the JSON null is the JavaScript null").toBe(null);
    expect(parseJson("[1,2]"), "arrays parse too").toEqual([1, 2]);
    expect(() => parseJson("{"), "invalid JSON throws rather than returning null - " +
      "swallowing the error is what buries the bug (README ex1)").toThrow();
  });

  test("ex2 - toNumber() converts only what it can defend", () => {
    expect(toNumber(3), "a finite number is itself").toBe(3);
    expect(toNumber(-2.5), "negatives and decimals included").toBe(-2.5);
    expect(toNumber(Number.NaN), "NaN is a number and is not a value").toBe(null);
    expect(toNumber(Number.POSITIVE_INFINITY), "and neither is Infinity").toBe(null);
    expect(toNumber("42"), "a numeric string converts").toBe(42);
    expect(toNumber("  7  "), "surrounding whitespace is trimmed first").toBe(7);
    expect(toNumber(""), "the empty string is not zero - Number() says it is, which " +
      "is the trap this exercise exists for (README ex2)").toBe(null);
    expect(toNumber("   "), "and neither is whitespace").toBe(null);
    expect(toNumber("abc"), "a non-numeric string is null").toBe(null);
    expect(toNumber(true), "a boolean is not a number here").toBe(null);
    expect(toNumber(null), "null is null").toBe(null);
    expect(toNumber({}), "and an object is too").toBe(null);
  });

  test("ex3 - describeShipment() covers every status", () => {
    expect(describeShipment({ status: "pending" }), "the waiting case").toBe("waiting to ship");
    expect(
      describeShipment({ status: "shipped", trackingId: "TR9" }),
      "the tracking id belongs in the sentence",
    ).toBe("in transit as TR9");
    expect(
      describeShipment({ status: "delivered", signedBy: "Ada" }),
      "and so does the signature",
    ).toBe("delivered to Ada");
    expect(
      describeShipment({ status: "cancelled", reason: "out of stock" }),
      "and the reason",
    ).toBe("cancelled: out of stock");
    expect(() => assertUnreachable("mystery" as never), "the runtime half of the " +
      "exhaustiveness check has to name the value it was surprised by").toThrow(/mystery/);
  });

  test("ex4 - createCache() only hands back what the guard accepts", () => {
    const cache = createCache();
    cache.set("count", 3);
    cache.set("name", "ada");
    expect(cache.get("count", isNumber), "stored as a number, read as a number").toBe(3);
    expect(cache.get("name", isString), "and the same for the string").toBe("ada");
    expect(cache.get("count", isString), "the wrong guard returns null rather than " +
      "the value - the cache is untyped inside, so the guard is the only proof").toBe(null);
    expect(cache.get("missing", isNumber), "an absent key is null").toBe(null);
    expect(cache.has("count"), "has() reports presence").toBe(true);
    expect(cache.has("missing"), "and absence").toBe(false);
    cache.set("count", 4);
    expect(cache.get("count", isNumber), "a second set overwrites").toBe(4);
  });

  test("ex6 - deepGet() walks a path through an unknown value", () => {
    const config: unknown = { server: { ports: [8080, 9090], name: "edge" } };
    expect(deepGet(config, ["server", "name"]), "two steps to a string").toBe("edge");
    expect(deepGet(config, ["server", "ports", "1"]), "array indices are string keys").toBe(9090);
    expect(deepGet(config, []), "an empty path is the value itself").toBe(config);
    expect(deepGet(config, ["server", "missing"]), "a missing key is undefined").toBe(undefined);
    expect(deepGet(config, ["server", "name", "nope"]), "walking into a string stops - " +
      "the walk must check the container at every step, not only the first").toBe(undefined);
    expect(deepGet(null, ["a"]), "null has no properties and is not a crash").toBe(undefined);
    expect(deepGet(undefined, ["a"]), "and neither does undefined").toBe(undefined);
  });

  test("ex7 - isJsonValue() accepts exactly what JSON can hold", () => {
    expect(isJsonValue({ a: [1, "x", null, { b: true }] }), "a nested document").toBe(true);
    expect(isJsonValue([]), "an empty array").toBe(true);
    expect(isJsonValue({}), "an empty object").toBe(true);
    expect(isJsonValue(0), "zero is a number").toBe(true);
    expect(isJsonValue(null), "null is a JSON value - the guard must not reject it " +
      "along with undefined (README ex7)").toBe(true);
    expect(isJsonValue(undefined), "undefined is not").toBe(false);
    expect(isJsonValue(Number.NaN), "NaN has no JSON spelling").toBe(false);
    expect(isJsonValue(() => 1), "a function is not data").toBe(false);
    expect(isJsonValue({ a: undefined }), "one bad value fails the whole document").toBe(false);
    expect(isJsonValue([1, () => 1]), "and that is true inside arrays too").toBe(false);
  });

  test("ex8 - requirePort() returns a port or never returns", () => {
    expect(requirePort(8080), "a valid port comes back as a number").toBe(8080);
    expect(requirePort("443"), "a numeric string is accepted").toBe(443);
    expect(requirePort("  22  "), "with whitespace trimmed").toBe(22);
    expect(() => requirePort(0), "0 is out of range").toThrow(/port/);
    expect(() => requirePort(70000), "and so is 70000").toThrow(/port/);
    expect(() => requirePort(80.5), "a port is an integer").toThrow(/port/);
    expect(() => requirePort("abc"), "a non-numeric string throws").toThrow(/port/);
    expect(() => requirePort(null), "and so does null").toThrow(/port/);
    expect(() => fail("boom"), "fail() throws the message it was given").toThrow(/boom/);
  });
});
```

This is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/d19_unknown_any_never. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { parseJson } from "./ex1/solution";
import { toNumber } from "./ex2/solution";
import { assertUnreachable } from "./ex3/solution";
import { createCache } from "./ex4/solution";
import type { OmitNever } from "./ex5/solution";
import { deepGet } from "./ex6/solution";
import type { JsonValue } from "./ex7/solution";
import { isJsonValue } from "./ex7/solution";
import { fail, requirePort } from "./ex8/solution";

const isNumber = (value: unknown): value is number => typeof value === "number";

describe("d19_unknown_any_never", () => {
  test("ex1 - parseJson() hands back unknown, not any", () => {
    expectTypeOf(parseJson("1")).toEqualTypeOf<unknown>();
    // @ts-expect-error - nothing has been proved about the parsed value yet.
    parseJson("1").length;
    const parsed = parseJson("1");
    if (typeof parsed === "number") {
      expectTypeOf(parsed).toEqualTypeOf<number>();
    }
  });

  test("ex2 - toNumber() promises a number or nothing", () => {
    expectTypeOf(toNumber("42")).toEqualTypeOf<number | null>();
    expectTypeOf(toNumber(3)).toEqualTypeOf<number | null>();
    const value = toNumber("42");
    if (value !== null) {
      expectTypeOf(value).toEqualTypeOf<number>();
    }
  });

  test("ex3 - assertUnreachable() accepts only never", () => {
    expectTypeOf(assertUnreachable).parameters.toEqualTypeOf<[value: never]>();
    // @ts-expect-error - a string is not never, which is the whole point of the check.
    assertUnreachable("pending");
    assertUnreachable("pending" as never);
  });

  test("ex4 - the cache returns the guarded type or null", () => {
    const cache = createCache();
    cache.set("count", 3);
    expectTypeOf(cache.get("count", isNumber)).toEqualTypeOf<number | null>();
    expectTypeOf(cache.has("count")).toEqualTypeOf<boolean>();
    expectTypeOf(cache.set).returns.toEqualTypeOf<void>();
  });

  test("ex5 - OmitNever<T> drops the members typed never", () => {
    expectTypeOf<OmitNever<{ a: string; b: never; c: number }>>().toEqualTypeOf<{
      a: string;
      c: number;
    }>();
    expectTypeOf<OmitNever<{ a: string }>>().toEqualTypeOf<{ a: string }>();
    expectTypeOf<keyof OmitNever<{ a: never }>>().toEqualTypeOf<never>();
    expectTypeOf<OmitNever<{ a: never; b: undefined }>>().toEqualTypeOf<{ b: undefined }>();
  });

  test("ex6 - deepGet() stays unknown all the way out", () => {
    expectTypeOf(deepGet({}, ["a"])).toEqualTypeOf<unknown>();
    // @ts-expect-error - the walk cannot know what it found, so neither can you.
    deepGet({}, ["a"]).length;
    const found = deepGet({}, ["a"]);
    if (typeof found === "string") {
      expectTypeOf(found).toEqualTypeOf<string>();
    }
  });

  test("ex7 - isJsonValue() narrows to the recursive JSON type", () => {
    const value: unknown = { a: 1 };
    if (isJsonValue(value)) {
      expectTypeOf(value).toEqualTypeOf<JsonValue>();
    }
    const other: unknown = [];
    if (isJsonValue(other)) {
      expectTypeOf(other).toEqualTypeOf<JsonValue>();
    }
  });

  test("ex8 - fail() returns never and the compiler believes it", () => {
    expectTypeOf(fail).parameters.toEqualTypeOf<[message: string]>();
    expectTypeOf(requirePort(8080)).toEqualTypeOf<number>();
    function pickString(value: unknown): string {
      if (typeof value === "string") {
        return value;
      }
      fail("ex8 - not a string");
    }
    expectTypeOf(pickString).returns.toEqualTypeOf<string>();
    const chosen = (0 as unknown) === 0 ? 1 : fail("ex8 - impossible");
    expectTypeOf(chosen).toEqualTypeOf<number>();
  });
});
```

An exercise is green only when both gates agree about it.
