// Type gate for typescript/d20_satisfies_asconst. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { RETRY } from "./ex1/solution";
import { minMax } from "./ex2/solution";
import { PALETTE } from "./ex3/solution";
import type { RouteMethod, RoutePath } from "./ex4/solution";
import { ROUTES } from "./ex4/solution";
import { CONFIG } from "./ex5/solution";
import { tupleOf } from "./ex6/solution";
import type { Feature, PlanName } from "./ex7/solution";
import { PLANS } from "./ex7/solution";
import type { FlagName, Flags } from "./ex8/solution";

describe("d20_satisfies_asconst", () => {
  test("ex1 - RETRY is frozen at the type level", () => {
    expectTypeOf<typeof RETRY>().toEqualTypeOf<{
      readonly attempts: 3;
      readonly backoffMs: 250;
      readonly jitter: false;
    }>();
    expectTypeOf(RETRY.attempts).toEqualTypeOf<3>();
    // @ts-expect-error - every member is readonly after a const assertion.
    RETRY.attempts = 4;
  });

  test("ex2 - minMax() returns a readonly pair, not an array", () => {
    expectTypeOf(minMax([1, 2])).toEqualTypeOf<readonly [number, number]>();
    const pair = minMax([1, 2]);
    expectTypeOf(pair[0]).toEqualTypeOf<number>();
    // @ts-expect-error - the pair a const assertion produces cannot be written to.
    pair[0] = 9;
  });

  test("ex3 - PALETTE keeps its own keys", () => {
    expectTypeOf<keyof typeof PALETTE>().toEqualTypeOf<"primary" | "danger" | "muted">();
    // @ts-expect-error - accent is not one of the three colours.
    PALETTE.accent;
  });

  test("ex4 - the route table publishes its own paths", () => {
    expectTypeOf<RoutePath>().toEqualTypeOf<"/" | "/users">();
    expectTypeOf<RouteMethod>().toEqualTypeOf<"GET" | "POST">();
    expectTypeOf<(typeof ROUTES)["length"]>().toEqualTypeOf<3>();
    // @ts-expect-error - the table is readonly all the way down.
    ROUTES[0].path = "/other";
  });

  test("ex5 - CONFIG is checked without being widened", () => {
    expectTypeOf(CONFIG.mode).toEqualTypeOf<"strict">();
    expectTypeOf(CONFIG.retries).toEqualTypeOf<number>();
    // @ts-expect-error - mode is the literal strict, so lenient no longer fits.
    CONFIG.mode = "lenient";
  });

  test("ex6 - tupleOf() infers a tuple of literals", () => {
    expectTypeOf(tupleOf([1, "a"])).toEqualTypeOf<readonly [1, "a"]>();
    expectTypeOf(tupleOf(["ready"])).toEqualTypeOf<readonly ["ready"]>();
    expectTypeOf(tupleOf([])).toEqualTypeOf<readonly []>();
  });

  test("ex7 - the plan table publishes its names and its features", () => {
    expectTypeOf<PlanName>().toEqualTypeOf<"free" | "pro" | "scale">();
    expectTypeOf<Feature>().toEqualTypeOf<"basic" | "api" | "sso">();
    expectTypeOf(PLANS.pro.seats).toEqualTypeOf<10>();
    // @ts-expect-error - enterprise is not a plan.
    PLANS.enterprise;
  });

  test("ex8 - Flags is derived from the spec, one member per flag", () => {
    expectTypeOf<FlagName>().toEqualTypeOf<"verbose" | "retries" | "out">();
    expectTypeOf<Flags>().toEqualTypeOf<{ verbose: boolean; retries: number; out: string }>();
  });
});
