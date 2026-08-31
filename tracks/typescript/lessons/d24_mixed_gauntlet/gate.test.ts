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
