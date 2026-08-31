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
