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
