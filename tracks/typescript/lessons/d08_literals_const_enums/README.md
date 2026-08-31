# d08 - Literals, const assertions and enums (drill set)

Eight problems on the narrow end of the type system: string and number literal
unions, `as const`, `keyof typeof`, and both flavours of `enum`. They drill
lesson **05_literals_enums**; go back there if you cannot say what `as const`
changes and what it leaves alone.

**Every stub in this set widens something it should not** - a literal union
declared as `string`, an array that lost its `as const`, an enum replaced by a
plain object. Narrowing them back is where each exercise starts.

## ex1 - turn right

`Direction` is `"north" | "east" | "south" | "west"`. `turnRight(direction)`
returns the next one clockwise, wrapping from west back to north.

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d08_literals_const_enums ex1
```

## ex2 - a type derived from a list

`SHORTCUTS` is `["copy", "paste", "undo"] as const`, and `Shortcut` is derived
from it with `(typeof SHORTCUTS)[number]` - one list, no second place to forget
to update. Then:

- `isShortcut(value)` is a type predicate over `string`
- `shortcutIndex(shortcut)` returns the position in the list

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d08_literals_const_enums ex2
```

## ex3 - a string enum

`Lane` is a **string enum** with `Left = "left"`, `Center = "center"`,
`Right = "right"`. `laneOffset(lane)` returns `-1`, `0` or `1`, and
`shift(lane, by)` moves that many lanes, **clamping** at both ends.

- `shift(Lane.Right, 5)` -> `Lane.Right`, `shift(Lane.Center, -3)` -> `Lane.Left`

The stub replaced the enum with a plain object and a `string` alias. Put the
enum back.

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d08_literals_const_enums ex3
```

## ex4 - a numeric enum, and its reverse map

`Level` is a **numeric enum**: `Debug = 10`, `Info = 20`, `Warn = 30`,
`Error = 40`. `atLeast(level, min)` compares them, and `nameOf(level)` returns
the member's **name** - which a numeric enum can do and a string enum cannot,
because only a numeric one compiles to a reverse mapping.

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d08_literals_const_enums ex4
```

## ex5 - keyof typeof over a const table

`PRICES` is `{ standard: 500, express: 1200, overnight: 2500 } as const`, and
`Speed` is `keyof typeof PRICES`. `priceOf(speed)` reads the table and
`cheapest()` returns the speed with the lowest price - computed from the table,
not hard-coded.

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d08_literals_const_enums ex5
```

## ex6 - two unions, one sku

`Size` is `"s" | "m" | "l"`; `Colour` is `"red" | "blue"`. `sku(size, colour)`
renders `"<colour>-<size>"`, and `parseSku(text)` returns
`{ size, colour }` or `null` when either half is unknown, when a part is
missing, or when there are more than two parts.

- `sku("m", "red")` -> `"red-m"`
- `parseSku("red-m")` -> `{ size: "m", colour: "red" }`
- `parseSku("green-m")`, `parseSku("red")`, `parseSku("red-m-extra")` -> `null`

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d08_literals_const_enums ex6
```

## ex7 - a transition table over a literal union

`Light` is `"red" | "green" | "amber"`, and `NEXT` is a
`Record<Light, Light>` holding the cycle: red to green, green to amber, amber to
red. `cycle(start, steps)` walks it - and `steps` may be **negative**, so a bare
`%` is not enough.

- `cycle("red", 3)` -> `"red"`, `cycle("red", -1)` -> `"amber"`
- `cycle("amber", 5)` -> `"green"`

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d08_literals_const_enums ex7
```

## ex8 - two unions that make a week

`Weekday` is `"mon" | "tue" | "wed" | "thu" | "fri"`, `Weekend` is
`"sat" | "sun"`, and `Day` is their union. Write:

- `isWeekend(day)` as a type predicate, so the `else` branch narrows to `Weekday`
- `shiftDay(day, by)` moving through the week in either direction, wrapping
- `nextWorkday(day)` returning the next `Weekday` strictly after `day`

- `shiftDay("mon", -8)` -> `"sun"`, `shiftDay("wed", 14)` -> `"wed"`
- `nextWorkday("fri")` -> `"mon"`, `nextWorkday("sat")` -> `"mon"`

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d08_literals_const_enums ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/d08_literals_const_enums. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { turnRight } from "./ex1/solution";
import { SHORTCUTS, isShortcut, shortcutIndex } from "./ex2/solution";
import { Lane, laneOffset, shift } from "./ex3/solution";
import { Level, atLeast, nameOf } from "./ex4/solution";
import { PRICES, cheapest, priceOf } from "./ex5/solution";
import { parseSku, sku } from "./ex6/solution";
import { NEXT, cycle } from "./ex7/solution";
import { isWeekend, nextWorkday, shiftDay } from "./ex8/solution";

describe("d08_literals_const_enums", () => {
  test("ex1 - turnRight() walks the compass and wraps", () => {
    expect(turnRight("north"), "a quarter turn right from north is east").toBe("east");
    expect(turnRight("east"), "east becomes south").toBe("south");
    expect(turnRight("south"), "south becomes west").toBe("west");
    expect(
      turnRight("west"),
      "and west wraps back to north - the compass has no end (README ex1)",
    ).toBe("north");
  });

  test("ex2 - the shortcut list is the source of truth", () => {
    expect(SHORTCUTS, "the values are unchanged - as const changes types, not data").toEqual([
      "copy",
      "paste",
      "undo",
    ]);
    expect(isShortcut("copy"), "a known shortcut passes").toBe(true);
    expect(isShortcut("redo"), "an unknown one does not").toBe(false);
    expect(isShortcut(""), "and neither does the empty string").toBe(false);
    expect(shortcutIndex("copy"), "copy is first").toBe(0);
    expect(shortcutIndex("undo"), "and undo is last").toBe(2);
  });

  test("ex3 - the Lane enum is its string at runtime", () => {
    expect(
      Lane.Center,
      "a string enum member IS its string once compiled - that is why it survives " +
        "JSON and a database column",
    ).toBe("center");
    expect(laneOffset(Lane.Left), "left is one to the left of centre").toBe(-1);
    expect(laneOffset(Lane.Center), "centre is the origin").toBe(0);
    expect(laneOffset(Lane.Right), "right is one to the right").toBe(1);
    expect(shift(Lane.Left, 1), "one step right from the left lane is the centre").toBe(
      Lane.Center,
    );
    expect(
      shift(Lane.Right, 5),
      "there is no lane past the right one, so a big step clamps",
    ).toBe(Lane.Right);
    expect(shift(Lane.Center, -3), "and a big step the other way clamps too").toBe(Lane.Left);
    expect(shift(Lane.Center, 0), "no step is no change").toBe(Lane.Center);
  });

  test("ex4 - the Level enum has numbers and a reverse map", () => {
    expect(Level.Info, "the members really are the numbers you wrote").toBe(20);
    expect(
      nameOf(Level.Warn),
      "a NUMERIC enum also compiles to a reverse mapping, so the name can be " +
        "looked up from the value (README ex4)",
    ).toBe("Warn");
    expect(nameOf(Level.Debug), "and again for the lowest level").toBe("Debug");
    expect(atLeast(Level.Warn, Level.Info), "a warning clears an info threshold").toBe(true);
    expect(atLeast(Level.Debug, Level.Info), "a debug line does not").toBe(false);
    expect(
      atLeast(Level.Info, Level.Info),
      "at least means at least - the threshold itself passes",
    ).toBe(true);
  });

  test("ex5 - the price table drives both functions", () => {
    expect(priceOf("standard"), "the table is the only place the numbers live").toBe(500);
    expect(priceOf("overnight"), "and again for the dearest option").toBe(2500);
    expect(cheapest(), "standard is the cheapest speed in the table").toBe("standard");
    expect(PRICES.express, "as const changed the types, not the values").toBe(1200);
    expect(
      Object.keys(PRICES),
      "no key is added or removed by any of this",
    ).toEqual(["standard", "express", "overnight"]);
  });

  test("ex6 - sku() and parseSku() are inverses", () => {
    expect(sku("m", "red"), "the colour comes first, then the size").toBe("red-m");
    expect(sku("s", "blue"), "and again").toBe("blue-s");
    expect(parseSku("red-m"), "a valid sku parses back into its two parts").toEqual({
      size: "m",
      colour: "red",
    });
    expect(parseSku("green-m"), "an unknown colour is not a sku").toBeNull();
    expect(parseSku("red-xl"), "and neither is an unknown size").toBeNull();
    expect(parseSku("red"), "a sku with no size at all is not a sku").toBeNull();
    expect(parseSku("red-m-extra"), "and neither is one with a third part").toBeNull();
    expect(parseSku(sku("l", "blue")), "round trip: build one, parse it back").toEqual({
      size: "l",
      colour: "blue",
    });
  });

  test("ex7 - cycle() walks the transition table both ways", () => {
    expect(NEXT.red, "the table itself is checked: red is followed by green").toBe("green");
    expect(NEXT.amber, "and amber wraps to red").toBe("red");
    expect(cycle("red", 1), "one step from red is green").toBe("green");
    expect(cycle("red", 3), "three steps is a full lap, back to red").toBe("red");
    expect(cycle("green", 0), "no steps is no change").toBe("green");
    expect(
      cycle("red", -1),
      "a negative step walks backwards, so red goes to amber - and a plain % " +
        "would give you a negative index (README ex7)",
    ).toBe("amber");
    expect(cycle("amber", 5), "five steps from amber lands on green").toBe("green");
    expect(cycle("green", -4), "and four back from green lands on red").toBe("red");
  });

  test("ex8 - the week is two literal unions joined", () => {
    expect(isWeekend("sat"), "saturday is the weekend").toBe(true);
    expect(isWeekend("sun"), "so is sunday").toBe(true);
    expect(isWeekend("mon"), "monday is not").toBe(false);
    expect(shiftDay("mon", 1), "one day on from monday is tuesday").toBe("tue");
    expect(shiftDay("sun", 1), "the week wraps: sunday plus one is monday").toBe("mon");
    expect(shiftDay("mon", -1), "and backwards too: monday minus one is sunday").toBe("sun");
    expect(shiftDay("wed", 14), "two whole weeks lands where it started").toBe("wed");
    expect(shiftDay("mon", -8), "eight days back from monday is sunday").toBe("sun");
    expect(shiftDay("mon", 0), "no shift is no change").toBe("mon");
    expect(nextWorkday("mon"), "the next working day after monday is tuesday").toBe("tue");
    expect(nextWorkday("fri"), "friday skips the whole weekend").toBe("mon");
    expect(nextWorkday("sat"), "and so does saturday").toBe("mon");
    expect(nextWorkday("sun"), "sunday is one step from monday").toBe("mon");
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/d08_literals_const_enums. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Direction } from "./ex1/solution";
import { turnRight } from "./ex1/solution";
import type { Shortcut } from "./ex2/solution";
import { SHORTCUTS, isShortcut, shortcutIndex } from "./ex2/solution";
import { Lane, laneOffset, shift } from "./ex3/solution";
import { Level, nameOf } from "./ex4/solution";
import type { Speed } from "./ex5/solution";
import { PRICES, cheapest, priceOf } from "./ex5/solution";
import type { Colour, Size } from "./ex6/solution";
import { parseSku, sku } from "./ex6/solution";
import type { Light } from "./ex7/solution";
import { cycle } from "./ex7/solution";
import type { Day, Weekday, Weekend } from "./ex8/solution";
import { isWeekend, nextWorkday, shiftDay } from "./ex8/solution";

describe("d08_literals_const_enums", () => {
  test("ex1 - Direction has exactly four values", () => {
    expectTypeOf<Direction>().toEqualTypeOf<"north" | "east" | "south" | "west">();
    expectTypeOf(turnRight("north")).toEqualTypeOf<Direction>();
    // @ts-expect-error - up is not a compass direction.
    turnRight("up");
  });

  test("ex2 - the shortcut type is derived from the list", () => {
    expectTypeOf<Shortcut>().toEqualTypeOf<"copy" | "paste" | "undo">();
    expectTypeOf(SHORTCUTS).toEqualTypeOf<readonly ["copy", "paste", "undo"]>();
    function use(value: string): void {
      if (isShortcut(value)) {
        expectTypeOf(value).toEqualTypeOf<"copy" | "paste" | "undo">();
      }
    }
    use("copy");
    expectTypeOf(shortcutIndex("undo")).toEqualTypeOf<number>();
    // @ts-expect-error - as const made the list readonly.
    SHORTCUTS.push("redo");
  });

  test("ex3 - a string enum is nominal", () => {
    expectTypeOf<Lane>().not.toEqualTypeOf<string>();
    expectTypeOf(laneOffset).parameters.toEqualTypeOf<[lane: Lane]>();
    expectTypeOf(shift(Lane.Left, 1)).toEqualTypeOf<Lane>();
    // @ts-expect-error - the raw string is not assignable to the enum type.
    laneOffset("left");
  });

  test("ex4 - a numeric enum is not just a number", () => {
    expectTypeOf<Level>().not.toEqualTypeOf<number>();
    expectTypeOf(nameOf(Level.Info)).toEqualTypeOf<string>();
    // @ts-expect-error - the label is not a Level.
    nameOf("Warn");
  });

  test("ex5 - Speed is the key set of the price table", () => {
    expectTypeOf<Speed>().toEqualTypeOf<"standard" | "express" | "overnight">();
    expectTypeOf(PRICES.express).toEqualTypeOf<1200>();
    expectTypeOf(cheapest()).toEqualTypeOf<Speed>();
    expectTypeOf(priceOf("standard")).toEqualTypeOf<number>();
    // @ts-expect-error - as const made every member readonly.
    PRICES.standard = 1;
    // @ts-expect-error - there is no such speed.
    priceOf("teleport");
  });

  test("ex6 - two literal unions, one sku", () => {
    expectTypeOf<Size>().toEqualTypeOf<"s" | "m" | "l">();
    expectTypeOf<Colour>().toEqualTypeOf<"red" | "blue">();
    expectTypeOf(sku("m", "red")).toEqualTypeOf<string>();
    expectTypeOf(parseSku("red-m")).toEqualTypeOf<{ size: Size; colour: Colour } | null>();
    // @ts-expect-error - xl is not a size this shop stocks.
    sku("xl", "red");
  });

  test("ex7 - Light is the three lamps and nothing else", () => {
    expectTypeOf<Light>().toEqualTypeOf<"red" | "green" | "amber">();
    expectTypeOf(cycle("red", 1)).toEqualTypeOf<Light>();
    // @ts-expect-error - there is no blue light.
    cycle("blue", 1);
  });

  test("ex8 - Day is the union of two smaller unions", () => {
    expectTypeOf<Weekday>().toEqualTypeOf<"mon" | "tue" | "wed" | "thu" | "fri">();
    expectTypeOf<Weekend>().toEqualTypeOf<"sat" | "sun">();
    expectTypeOf<Day>().toEqualTypeOf<Weekday | Weekend>();
    function use(day: Day): void {
      if (isWeekend(day)) {
        expectTypeOf(day).toEqualTypeOf<Weekend>();
      } else {
        expectTypeOf(day).toEqualTypeOf<Weekday>();
      }
    }
    use("mon");
    expectTypeOf(shiftDay("mon", 1)).toEqualTypeOf<Day>();
    expectTypeOf(nextWorkday("fri")).toEqualTypeOf<Weekday>();
    // @ts-expect-error - funday is not a day of this week.
    shiftDay("funday", 1);
  });
});
```

An exercise is green only when both gates agree about it.
