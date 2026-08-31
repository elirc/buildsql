# d06 - Narrowing and guards (drill set)

Eight problems on proving what a value is: `typeof`, `instanceof`,
`Array.isArray`, user-defined type predicates and assertion functions. They
drill lessons **04_unions_narrowing** and **10_guards_assertions**; redo those
first if `value is T` and `asserts value is T` blur together.

Everything here is the boundary of a system - JSON that arrived from somewhere,
configuration nobody typed, values whose only honest type is `unknown`.

## ex1 - is this text

`isNonEmptyString(value)` is a type predicate over `unknown`. It is true only
for a string with something other than whitespace in it.

Edit `ex1/solution.ts`, where the return type is a plain `boolean` and so tells
the caller nothing.

```
uv run dojo test typescript d06_narrowing_guards ex1
```

## ex2 - what is this, exactly

`ValueKind` is `"string" | "number" | "boolean" | "undefined" | "null" |
"array" | "object" | "function"`, and `kindOf(value)` returns the right one.
`typeof null` is `"object"` and `typeof []` is `"object"`, so both need their
own check.

- `kindOf(null)` -> `"null"`, `kindOf([1])` -> `"array"`, `kindOf(NaN)` -> `"number"`

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d06_narrowing_guards ex2
```

## ex3 - is this a point

`isPoint(value)` is a type predicate for `{ x: number; y: number }`. Extra
members are fine; a missing one, a wrong type, `null` and an array are not.

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d06_narrowing_guards ex3
```

## ex4 - assert, do not ask

`assertIsRecord(value)` returns nothing and **throws** `"expected a plain
object"` for `null`, arrays and every primitive. After it returns, the caller's
value is narrowed to `Record<string, unknown>` for the rest of the scope - which
is what `asserts value is T` buys you and a `boolean` does not.

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d06_narrowing_guards ex4
```

## ex5 - three ways to spell a timestamp

`toMillis(value)` takes `number | string | Date`:

- a number is already milliseconds
- a `Date` gives up its `getTime()`
- a string of digits (after trimming) is a millisecond count
- any other string is parsed as a date, and a string that is neither throws
  a message containing `cannot read a timestamp`

Edit `ex5/solution.ts`, where the parameter union has a member too many.

```
uv run dojo test typescript d06_narrowing_guards ex5
```

## ex6 - a guard that filters

`Tag` is `{ name: string; weight: number }`. Write `isTag(value)` as a type
predicate, then `collectTags(values)` over `readonly unknown[]` returns `Tag[]`
- and the guard is what makes that return type honest without a cast.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d06_narrowing_guards ex6
```

## ex7 - read a config nobody typed

`readConfig(raw)` turns `unknown` into a `Config` of `{ host, port, tls }`, or
throws on the **first** problem, in this order:

1. not a plain object -> `"config: expected an object"`
2. `host` missing, not a string, or blank -> `"config: host must be a non-empty string"`
3. `port` not a positive integer -> `"config: port must be a positive integer"`
4. `tls` not a boolean -> `"config: tls must be a boolean"`

The host is trimmed on the way out, and members the config does not declare are
dropped.

Edit `ex7/solution.ts`, whose return type is currently `unknown`.

```
uv run dojo test typescript d06_narrowing_guards ex7
```

## ex8 - flatten a recursive union

`TextNode` is `string | number | readonly TextNode[]`. `flattenText(node)`
renders it as one line: strings are trimmed, numbers stringified, arrays walked
depth-first, and pieces that come out empty contribute nothing - so there are
never two spaces in a row.

- `flattenText(["a", ["b", 2], "c"])` -> `"a b 2 c"`
- `flattenText(["", "a", ["", ""], "b"])` -> `"a b"`

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d06_narrowing_guards ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/d06_narrowing_guards. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { isNonEmptyString } from "./ex1/solution";
import { kindOf } from "./ex2/solution";
import { isPoint } from "./ex3/solution";
import { assertIsRecord } from "./ex4/solution";
import { toMillis } from "./ex5/solution";
import { collectTags, isTag } from "./ex6/solution";
import { readConfig } from "./ex7/solution";
import { flattenText } from "./ex8/solution";

describe("d06_narrowing_guards", () => {
  test("ex1 - isNonEmptyString() accepts text and nothing else", () => {
    expect(isNonEmptyString("a"), "a real string passes").toBe(true);
    expect(isNonEmptyString(""), "the empty string is not text").toBe(false);
    expect(
      isNonEmptyString("   "),
      "and neither is a string of only whitespace - reread README ex1",
    ).toBe(false);
    expect(isNonEmptyString(1), "a number is not a string, however it prints").toBe(false);
    expect(isNonEmptyString(null), "null is not a string").toBe(false);
    expect(isNonEmptyString(undefined), "and neither is undefined").toBe(false);
    expect(isNonEmptyString(["a"]), "an array of one string is not a string").toBe(false);
  });

  test("ex2 - kindOf() labels every runtime shape", () => {
    expect(kindOf("a"), "a string is string").toBe("string");
    expect(kindOf(1), "a number is number").toBe("number");
    expect(kindOf(Number.NaN), "NaN is a number too - typeof does not lie about that").toBe(
      "number",
    );
    expect(kindOf(true), "a boolean is boolean").toBe("boolean");
    expect(kindOf(undefined), "undefined is undefined").toBe("undefined");
    expect(
      kindOf(null),
      "null gets its own label, because typeof null is object and that is a wart",
    ).toBe("null");
    expect(
      kindOf([1, 2]),
      "an array gets its own label, because typeof [] is also object",
    ).toBe("array");
    expect(kindOf({ a: 1 }), "a plain object is object").toBe("object");
    expect(kindOf(() => 1), "a function is function").toBe("function");
  });

  test("ex3 - isPoint() checks the shape, not the class", () => {
    expect(isPoint({ x: 1, y: 2 }), "two numeric members is a point").toBe(true);
    expect(
      isPoint({ x: 1, y: 2, label: "origin" }),
      "extra members are fine - structural typing asks what is there",
    ).toBe(true);
    expect(isPoint({ x: 1 }), "a missing member is not a point").toBe(false);
    expect(isPoint({ x: "1", y: 2 }), "a member of the wrong type is not a point").toBe(false);
    expect(
      isPoint(null),
      "null is the classic miss: typeof null is object, so check for it explicitly",
    ).toBe(false);
    expect(isPoint([1, 2]), "a pair of numbers in an array is not a point").toBe(false);
    expect(isPoint("1,2"), "and neither is a string that describes one").toBe(false);
  });

  test("ex4 - assertIsRecord() throws for anything that is not a plain object", () => {
    expect(() => assertIsRecord({}), "an empty object is a plain object").not.toThrow();
    expect(() => assertIsRecord({ a: 1 }), "so is one with members").not.toThrow();
    expect(() => assertIsRecord(null), "null is not, with that exact message").toThrow(
      "expected a plain object",
    );
    expect(
      () => assertIsRecord([]),
      "an array is not a plain object here, even though typeof says object",
    ).toThrow("expected a plain object");
    expect(() => assertIsRecord("x"), "a string is not a plain object").toThrow(
      "expected a plain object",
    );
    expect(() => assertIsRecord(undefined), "and neither is undefined").toThrow(
      "expected a plain object",
    );
  });

  test("ex5 - toMillis() narrows three unrelated members", () => {
    expect(toMillis(0), "a number is already milliseconds - even zero").toBe(0);
    expect(toMillis(1234), "and so is any other number").toBe(1234);
    expect(toMillis(new Date(1234)), "a Date is recognised with instanceof").toBe(1234);
    expect(toMillis("1234"), "a string of digits is a millisecond count").toBe(1234);
    expect(toMillis("  1234  "), "trimmed first").toBe(1234);
    expect(
      toMillis("2026-03-01T00:00:00.000Z"),
      "anything else is parsed as a date - ISO 8601 is the format the spec pins down",
    ).toBe(Date.UTC(2026, 2, 1));
    expect(
      () => toMillis("later"),
      "a string that is neither a count nor a date has to fail loudly",
    ).toThrow(/cannot read a timestamp/);
  });

  test("ex6 - isTag() lets filter() narrow the whole array", () => {
    expect(isTag({ name: "a", weight: 1 }), "the right shape passes").toBe(true);
    expect(isTag({ name: "a" }), "a missing weight fails").toBe(false);
    expect(isTag(null), "null fails").toBe(false);
    expect(
      collectTags([{ name: "a", weight: 1 }, null, "x", { name: "b", weight: 2 }]),
      "only the values that pass the guard survive, in input order",
    ).toEqual([
      { name: "a", weight: 1 },
      { name: "b", weight: 2 },
    ]);
    expect(collectTags([]), "nothing in, nothing out").toEqual([]);
    expect(collectTags([{ name: "a" }, 1, null]), "nothing passes, so an empty array").toEqual([]);
  });

  test("ex7 - readConfig() rejects the first bad field it finds", () => {
    expect(
      readConfig({ host: "localhost", port: 8080, tls: false }),
      "a valid config comes back as a Config",
    ).toEqual({ host: "localhost", port: 8080, tls: false });
    expect(
      readConfig({ host: "  localhost  ", port: 8080, tls: true, extra: "ignored" }),
      "the host is trimmed and unknown members are dropped, not copied",
    ).toEqual({ host: "localhost", port: 8080, tls: true });

    expect(() => readConfig(null), "null is not an object here").toThrow(
      "config: expected an object",
    );
    expect(() => readConfig([]), "and neither is an array").toThrow("config: expected an object");
    expect(() => readConfig("localhost"), "or a string").toThrow("config: expected an object");
    expect(
      () => readConfig({}),
      "the fields are checked in order, so an empty object fails on host first",
    ).toThrow("config: host must be a non-empty string");
    expect(() => readConfig({ host: "   ", port: 1, tls: true }), "a blank host fails").toThrow(
      "config: host must be a non-empty string",
    );
    expect(() => readConfig({ host: "h" }), "then the port").toThrow(
      "config: port must be a positive integer",
    );
    expect(() => readConfig({ host: "h", port: 0 }), "zero is not a port").toThrow(
      "config: port must be a positive integer",
    );
    expect(() => readConfig({ host: "h", port: 80.5 }), "and neither is a fraction").toThrow(
      "config: port must be a positive integer",
    );
    expect(() => readConfig({ host: "h", port: 80 }), "and finally tls").toThrow(
      "config: tls must be a boolean",
    );
  });

  test("ex8 - flattenText() walks a recursive union", () => {
    expect(flattenText("a"), "a bare string is itself").toBe("a");
    expect(flattenText("  a  "), "trimmed").toBe("a");
    expect(flattenText(7), "a number renders as text").toBe("7");
    expect(flattenText(0), "including zero, which is not an empty node").toBe("0");
    expect(
      flattenText(["a", ["b", 2], "c"]),
      "nested nodes flatten depth-first, joined by single spaces",
    ).toBe("a b 2 c");
    expect(flattenText([]), "an empty node list is an empty string").toBe("");
    expect(
      flattenText(["", "a", ["", ""], "b"]),
      "empty pieces contribute nothing at all - no double spaces (README ex8)",
    ).toBe("a b");
    expect(flattenText([[[["deep"]]]]), "depth is not limited").toBe("deep");
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/d06_narrowing_guards. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { isNonEmptyString } from "./ex1/solution";
import type { ValueKind } from "./ex2/solution";
import { kindOf } from "./ex2/solution";
import type { Point } from "./ex3/solution";
import { isPoint } from "./ex3/solution";
import { assertIsRecord } from "./ex4/solution";
import { toMillis } from "./ex5/solution";
import type { Tag } from "./ex6/solution";
import { collectTags, isTag } from "./ex6/solution";
import type { Config } from "./ex7/solution";
import { readConfig } from "./ex7/solution";
import type { TextNode } from "./ex8/solution";
import { flattenText } from "./ex8/solution";

describe("d06_narrowing_guards", () => {
  test("ex1 - isNonEmptyString() narrows unknown for its caller", () => {
    function use(value: unknown): void {
      if (isNonEmptyString(value)) {
        expectTypeOf(value).toEqualTypeOf<string>();
      } else {
        expectTypeOf(value).toEqualTypeOf<unknown>();
      }
    }
    use("a");
  });

  test("ex2 - ValueKind is a closed set of eight labels", () => {
    expectTypeOf<ValueKind>().toEqualTypeOf<
      "string" | "number" | "boolean" | "undefined" | "null" | "array" | "object" | "function"
    >();
    expectTypeOf(kindOf(null)).toEqualTypeOf<ValueKind>();
  });

  test("ex3 - isPoint() narrows unknown to Point", () => {
    function use(value: unknown): void {
      if (isPoint(value)) {
        expectTypeOf(value).toEqualTypeOf<Point>();
        expectTypeOf(value.x).toEqualTypeOf<number>();
      }
    }
    use({});
    expectTypeOf<Point>().toEqualTypeOf<{ x: number; y: number }>();
  });

  test("ex4 - assertIsRecord() narrows for the rest of the scope", () => {
    function use(value: unknown): void {
      assertIsRecord(value);
      expectTypeOf(value).toEqualTypeOf<Record<string, unknown>>();
    }
    use({});
  });

  test("ex5 - toMillis() takes exactly three member types", () => {
    expectTypeOf(toMillis).parameters.toEqualTypeOf<[value: number | string | Date]>();
    expectTypeOf(toMillis(0)).toEqualTypeOf<number>();
    // @ts-expect-error - null is not a timestamp.
    toMillis(null);
  });

  test("ex6 - collectTags() returns a narrowed array", () => {
    function use(value: unknown): void {
      if (isTag(value)) {
        expectTypeOf(value).toEqualTypeOf<Tag>();
      }
    }
    use({});
    expectTypeOf(collectTags([])).toEqualTypeOf<Tag[]>();
  });

  test("ex7 - readConfig() turns unknown into a Config", () => {
    expectTypeOf(readConfig({})).toEqualTypeOf<Config>();
    expectTypeOf<Config>().toEqualTypeOf<{ host: string; port: number; tls: boolean }>();
    // @ts-expect-error - readConfig takes the raw value, and it is required.
    readConfig();
  });

  test("ex8 - TextNode is a recursive union", () => {
    expectTypeOf<TextNode>().toEqualTypeOf<string | number | readonly TextNode[]>();
    expectTypeOf(flattenText(["a", 1])).toEqualTypeOf<string>();
    // @ts-expect-error - a node is never null.
    flattenText(null);
  });
});
```

An exercise is green only when both gates agree about it.
