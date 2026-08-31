# d22 - Declaration merging and ambient types (drill set)

Eight problems on the part of TypeScript that describes code rather than
containing it: declaration merging, namespaces, overload signatures and global
augmentation - the vocabulary every `.d.ts` file is written in. They drill
lesson **11_async_and_modules**, whose fourth exercise described an untyped
module, and lesson i1's declaration-merging question.

Both gates run: `gate.test.ts` checks that the values exist at runtime and
`gate.test-d.ts` checks that the declarations say so. Everything lives in
ordinary `.ts` files here, because that is where these constructs are graded -
but every one of them is exactly what you would write in a hand-authored
declaration file.

## ex1 - a function with members

`parseTag(raw)` splits `"dojo:ts"` into `{ scope: "dojo", name: "ts" }`. With no
colon, the whole string is the name and the scope is `""`.

The same name also carries two members:

- `parseTag.VERSION` - a `string` whose value is `"1.0"`
- `parseTag.isValid(raw)` - `true` when the string contains a colon

`Tag` is exported as an interface. Getting members onto a function without
writing `Object.assign` is the exercise.

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d22_declaration_files ex1
```

## ex2 - two signatures, one function

`box(value)` has two **overload signatures**:

- `box(value: string)` returns `{ kind: "text"; value: string }`
- `box(value: number)` returns `{ kind: "count"; value: number }`

and `box(true)` is a compile error.

- `box("hello")` -> `{ kind: "text", value: "hello" }`
- `box(0)` -> `{ kind: "count", value: 0 }` - the branch is on the *type*, not
  on truthiness

The implementation signature is not callable from outside; it exists only to
be wide enough for both overloads.

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d22_declaration_files ex2
```

## ex3 - add something to globalThis

Two exports plus one global.

`registerBuild(name, version)` records a build number on a global registry;
`readBuild(name)` reads it back and returns `number | undefined`.

The registry lives at `globalThis.__d22BuildRegistry`, typed
`Record<string, number> | undefined`, and it has to be **declared** so that
every module in the program can see the type - which is what a `.d.ts` file in
a real project would do for a polyfill, a test helper or a bundler-injected
constant.

- `readBuild("nothing")` -> `undefined` before anything is registered
- registering the same name twice overwrites

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d22_declaration_files ex3
```

## ex4 - a namespace of types and values

`Api` is a namespace holding all three kinds of declaration at once:

- `Api.Row` - an interface, `{ id: string; amount: number }`
- `Api.Id` - a type alias equal to `Row["id"]`, so `string`
- `Api.VERSION` - a value, the `number` `2`

`makeRow(id, amount)` takes an `Api.Id` and a `number` and returns an `Api.Row`.

Namespaced types are written `Api.Row`, with a dot, in type position.

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d22_declaration_files ex4
```

## ex5 - one interface, two declarations

`RequestContext` is declared **twice** in the file, once with `requestId: string`
and once with `locale: string`. The two declarations merge, so the type has both
members.

`describeContext(context)` returns `` `${requestId}@${locale}` ``.

- `describeContext({ requestId: "req-1", locale: "en-GB" })` -> `"req-1@en-GB"`

Interfaces merge; type aliases do not. That asymmetry is the reason libraries
publish their extension points as interfaces.

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d22_declaration_files ex5
```

## ex6 - an enum with helpers

`Level` is a numeric enum - `Debug = 10`, `Info = 20`, `Error = 40` - merged
with a namespace of the same name that adds two functions:

- `Level.isAtLeast(value, minimum)` - inclusive, so `isAtLeast(Info, Info)` is
  `true`
- `Level.parse(name)` - `Level | undefined`; `parse("Error")` is `40`,
  `parse("Fatal")` is `undefined`, and `parse("20")` is `undefined` too

That last case is the trap: a numeric enum object has entries in both
directions, so `Level["20"]` is the string `"Error"`, and a string is not a
level.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d22_declaration_files ex6
```

## ex7 - a registry other files can extend

`CommandRegistry` is an interface declared **empty** and then extended by two
further declarations - one adding `build: { target: string }`, one adding
`test: { pattern: string }`. That is the plugin-registry pattern: the base
declares the extension point, and each feature adds its own entry.

From it:

- `CommandName` is `keyof CommandRegistry`, so `"build" | "test"`
- `dispatch(name, payload)` is generic over `K extends CommandName` and takes
  `CommandRegistry[K]` as its payload, so `dispatch("build", { pattern: "x" })`
  is a compile error

`dispatch("build", { target: "web" })` -> `"build:web"`, and
`dispatch("test", { pattern: "*.ts" })` -> `"test:*.ts"`.

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d22_declaration_files ex7
```

## ex8 - a class, a type and a namespace

`Money` is one name in three declaration spaces at once - the capstone of this
set.

The class: `new Money(amount, currency)` with `readonly amount: number` and
`readonly currency: Money.Currency`.

- `plus` is overloaded: `plus(other: Money): Money` and `plus(amount: number): Money`.
  Adding two different currencies throws, and the message contains `currency`.
- `toString()` is the symbol followed by the amount to two decimal places, so
  `new Money(3, "USD").toString()` is `"$3.00"`

The namespace, merged onto the class:

- `Money.Currency` - the type `"USD" | "EUR"`
- `Money.SYMBOLS` - `Record<Currency, string>`, mapping `USD` to `$` and `EUR`
  to `E`
- `Money.zero(currency)` - a `Money` with an amount of `0`

`Money.zero("GBP")` is a compile error.

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d22_declaration_files ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Runtime gate for typescript/d22_declaration_files. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { parseTag } from "./ex1/solution";
import { box } from "./ex2/solution";
import { readBuild, registerBuild } from "./ex3/solution";
import { Api, makeRow } from "./ex4/solution";
import { describeContext } from "./ex5/solution";
import { Level } from "./ex6/solution";
import { dispatch } from "./ex7/solution";
import { Money } from "./ex8/solution";

describe("d22_declaration_files", () => {
  test("ex1 - parseTag() is a function with members bolted on", () => {
    expect(parseTag("dojo:ts"), "the part before the colon is the scope").toEqual({
      scope: "dojo",
      name: "ts",
    });
    expect(parseTag("plain"), "with no colon the whole string is the name").toEqual({
      scope: "",
      name: "plain",
    });
    expect(parseTag.VERSION, "the namespace member rides along on the function object").toBe("1.0");
    expect(parseTag.isValid("a:b"), "and so does the helper").toBe(true);
    expect(parseTag.isValid("plain"), "which says no to a tag with no scope").toBe(false);
  });

  test("ex2 - box() returns a different shape per overload", () => {
    expect(box("hello"), "a string is boxed as text").toEqual({ kind: "text", value: "hello" });
    expect(box(3), "a number is boxed as a count").toEqual({ kind: "count", value: 3 });
    expect(box(""), "the empty string is still a string - the branch is on the type, " +
      "not on the truthiness (README ex2)").toEqual({ kind: "text", value: "" });
    expect(box(0), "and zero is still a number").toEqual({ kind: "count", value: 0 });
  });

  test("ex3 - the build registry lives on globalThis", () => {
    expect(readBuild("nothing"), "an unregistered name reads back undefined").toBe(undefined);
    registerBuild("edge", 7);
    expect(readBuild("edge"), "what went in comes back out").toBe(7);
    registerBuild("edge", 8);
    expect(readBuild("edge"), "a second registration overwrites").toBe(8);
    registerBuild("api", 1);
    expect(readBuild("edge"), "and a second name does not disturb the first").toBe(8);
  });

  test("ex4 - the Api namespace carries types and a value together", () => {
    expect(makeRow("r1", 12), "the row is assembled from the two arguments").toEqual({
      id: "r1",
      amount: 12,
    });
    expect(Api.VERSION, "and the namespace also holds a runtime value").toBe(2);
  });

  test("ex5 - describeContext() sees both halves of the merged interface", () => {
    expect(
      describeContext({ requestId: "req-1", locale: "en-GB" }),
      "the request id and the locale, joined by an at sign",
    ).toBe("req-1@en-GB");
    expect(
      describeContext({ requestId: "req-2", locale: "fr" }),
      "and the same for any other pair",
    ).toBe("req-2@fr");
  });

  test("ex6 - Level is an enum and a namespace at once", () => {
    expect(Level.Info, "the enum member is still a number").toBe(20);
    expect(Level.isAtLeast(Level.Error, Level.Info), "40 is at least 20").toBe(true);
    expect(Level.isAtLeast(Level.Debug, Level.Info), "and 10 is not").toBe(false);
    expect(Level.isAtLeast(Level.Info, Level.Info), "the comparison is inclusive").toBe(true);
    expect(Level.parse("Error"), "a known name parses to its value").toBe(40);
    expect(Level.parse("Fatal"), "an unknown name is undefined").toBe(undefined);
    expect(Level.parse("20"), "and so is the reverse-mapped numeric key - a numeric enum " +
      "has entries in both directions and only one of them is a level (README ex6)").toBe(
      undefined,
    );
  });

  test("ex7 - dispatch() routes by the registered command name", () => {
    expect(dispatch("build", { target: "web" }), "the build handler reads target").toBe(
      "build:web",
    );
    expect(dispatch("test", { pattern: "*.ts" }), "and the test handler reads pattern").toBe(
      "test:*.ts",
    );
  });

  test("ex8 - Money is a class and a namespace with the same name", () => {
    const three = new Money(3, "USD");
    expect(three.plus(new Money(2, "USD")).amount, "two amounts add up").toBe(5);
    expect(three.plus(2).amount, "and the number overload adds a bare amount").toBe(5);
    expect(three.plus(2).currency, "keeping the currency of the receiver").toBe("USD");
    expect(Money.zero("EUR").amount, "the namespace factory builds an empty amount").toBe(0);
    expect(Money.zero("EUR").currency, "in the currency it was asked for").toBe("EUR");
    expect(Money.SYMBOLS.USD, "and the namespace holds the symbol table").toBe("$");
    expect(three.toString(), "which toString() uses, with two decimal places").toBe("$3.00");
    expect(() => three.plus(new Money(1, "EUR")), "adding two currencies is a mistake the " +
      "class has to refuse at runtime, because the type says both are Money").toThrow(/currency/);
  });
});
```

This is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/d22_declaration_files. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Tag } from "./ex1/solution";
import { parseTag } from "./ex1/solution";
import { box } from "./ex2/solution";
import { readBuild } from "./ex3/solution";
import { Api } from "./ex4/solution";
import type { RequestContext } from "./ex5/solution";
import { Level } from "./ex6/solution";
import type { CommandName } from "./ex7/solution";
import { dispatch } from "./ex7/solution";
import { Money } from "./ex8/solution";

describe("d22_declaration_files", () => {
  test("ex1 - parseTag() is callable and has members", () => {
    expectTypeOf(parseTag("a:b")).toEqualTypeOf<Tag>();
    expectTypeOf(parseTag.VERSION).toEqualTypeOf<string>();
    expectTypeOf(parseTag.isValid("a:b")).toEqualTypeOf<boolean>();
  });

  test("ex2 - each overload of box() has its own return type", () => {
    expectTypeOf(box("a")).toEqualTypeOf<{ kind: "text"; value: string }>();
    expectTypeOf(box(1)).toEqualTypeOf<{ kind: "count"; value: number }>();
    // @ts-expect-error - only strings and numbers can be boxed.
    box(true);
  });

  test("ex3 - the global declaration is visible to every module", () => {
    expectTypeOf(globalThis.__d22BuildRegistry).toEqualTypeOf<
      Record<string, number> | undefined
    >();
    expectTypeOf(readBuild("edge")).toEqualTypeOf<number | undefined>();
  });

  test("ex4 - Api holds an interface, a type alias and a value", () => {
    expectTypeOf<Api.Row>().toEqualTypeOf<{ id: string; amount: number }>();
    expectTypeOf<Api.Id>().toEqualTypeOf<string>();
    expectTypeOf(Api.VERSION).toEqualTypeOf<number>();
  });

  test("ex5 - RequestContext is the union of its declarations", () => {
    expectTypeOf<RequestContext>().toEqualTypeOf<{ requestId: string; locale: string }>();
    const context: RequestContext = { requestId: "r", locale: "en" };
    expectTypeOf(context.locale).toEqualTypeOf<string>();
  });

  test("ex6 - Level is usable as a type and as a namespace", () => {
    expectTypeOf(Level.isAtLeast(Level.Error, Level.Info)).toEqualTypeOf<boolean>();
    expectTypeOf(Level.parse("Info")).toEqualTypeOf<Level | undefined>();
    expectTypeOf<Level>().toEqualTypeOf<Level.Debug | Level.Info | Level.Error>();
  });

  test("ex7 - the registry decides which names and payloads exist", () => {
    expectTypeOf<CommandName>().toEqualTypeOf<"build" | "test">();
    expectTypeOf(dispatch("build", { target: "web" })).toEqualTypeOf<string>();
    // @ts-expect-error - the build command does not take a pattern.
    dispatch("build", { pattern: "x" });
  });

  test("ex8 - Money names a class, a type and a namespace", () => {
    expectTypeOf<Money.Currency>().toEqualTypeOf<"USD" | "EUR">();
    expectTypeOf(Money.zero("USD")).toEqualTypeOf<Money>();
    const three = new Money(3, "USD");
    expectTypeOf(three.plus(2)).toEqualTypeOf<Money>();
    expectTypeOf(three.plus(new Money(1, "USD"))).toEqualTypeOf<Money>();
    // @ts-expect-error - GBP is not one of the two currencies.
    Money.zero("GBP");
  });
});
```

An exercise is green only when both gates agree about it.
