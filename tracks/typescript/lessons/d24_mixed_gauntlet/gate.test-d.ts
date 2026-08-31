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
