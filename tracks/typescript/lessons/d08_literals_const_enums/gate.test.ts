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
