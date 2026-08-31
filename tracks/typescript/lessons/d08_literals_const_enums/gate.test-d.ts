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
