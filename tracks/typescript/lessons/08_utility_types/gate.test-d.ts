// Type gate for typescript/08_utility_types. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { applyPatch } from "./ex1/solution";
import type { PublicUser, User, UserSummary } from "./ex2/solution";
import { toPublicUser } from "./ex2/solution";
import type { MyPartial, MyPick } from "./ex3/solution";
import { pickKeys } from "./ex3/solution";
import type { Loaded } from "./ex4/solution";
import { once } from "./ex4/solution";
import type { MyOmit } from "./challenge/solution";
import { omitKeys } from "./challenge/solution";
import type { ScoreBoard } from "./review1/solution";

interface Options {
  retries: number;
  label: string;
}

describe("08_utility_types", () => {
  test("ex1 - applyPatch() takes a Partial and returns a whole", () => {
    const base: Options = { retries: 1, label: "run" };
    expectTypeOf(applyPatch(base, { label: "nightly" })).toEqualTypeOf<Options>();
    expectTypeOf(applyPatch(base, {})).toEqualTypeOf<Options>();
    // @ts-expect-error - a patch may omit members, but not invent them.
    applyPatch(base, { nope: 1 });
  });

  test("ex2 - PublicUser and UserSummary are derived from User", () => {
    expectTypeOf<PublicUser>().toEqualTypeOf<Omit<User, "passwordHash">>();
    expectTypeOf<UserSummary>().toEqualTypeOf<{ id: string; email: string }>();
    const publicUser = toPublicUser({
      id: "u1",
      email: "a@b.c",
      passwordHash: "h",
      createdAt: "2026-01-01",
    });
    // @ts-expect-error - the hash is gone from the type, not just from the value.
    publicUser.passwordHash;
  });

  test("ex3 - MyPartial and MyPick behave like the built-ins", () => {
    expectTypeOf<MyPartial<Options>>().toEqualTypeOf<{ retries?: number; label?: string }>();
    expectTypeOf<MyPick<Options, "label">>().toEqualTypeOf<{ label: string }>();
    const picked = pickKeys({ retries: 1, label: "run" }, ["label"]);
    expectTypeOf(picked).toEqualTypeOf<{ label: string }>();
    // @ts-expect-error - "nope" is not a key of the source object.
    pickKeys({ retries: 1 }, ["nope"]);
  });

  test("ex4 - Awaited, Parameters and ReturnType carry the shapes through", () => {
    expectTypeOf<Loaded>().toEqualTypeOf<{ id: string; title: string }>();
    const memo = once((a: number, b: number) => a + b);
    expectTypeOf(memo).parameters.toEqualTypeOf<[a: number, b: number]>();
    expectTypeOf(memo).returns.toEqualTypeOf<number>();
    // @ts-expect-error - the wrapped function takes two numbers.
    memo("2", 3);
  });

  test("challenge - MyOmit is Pick over the remaining keys", () => {
    expectTypeOf<MyOmit<Options, "retries">>().toEqualTypeOf<{ label: string }>();
    expectTypeOf(omitKeys({ retries: 1, label: "run" }, ["retries"])).toEqualTypeOf<{
      label: string;
    }>();
    // @ts-expect-error - you can only omit keys the object has.
    omitKeys({ retries: 1 }, ["missing"]);
  });

  test("review1 - ScoreBoard has exactly three required counters", () => {
    expectTypeOf<ScoreBoard>().toEqualTypeOf<{ pass: number; fail: number; skip: number }>();
    // @ts-expect-error - a board missing a verdict is not a ScoreBoard.
    const partialBoard: ScoreBoard = { pass: 1, fail: 0 };
  });
});
