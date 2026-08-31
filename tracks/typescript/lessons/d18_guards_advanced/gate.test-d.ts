// Type gate for typescript/d18_guards_advanced. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { isNonEmpty } from "./ex1/solution";
import { hasKey } from "./ex2/solution";
import { isOneOf } from "./ex3/solution";
import type { Row } from "./ex4/solution";
import { assertRow } from "./ex4/solution";
import type { Task } from "./ex5/solution";
import { onlyKind } from "./ex5/solution";
import { isRecord, isStringRecord } from "./ex6/solution";
import { everyIs } from "./ex7/solution";
import { objectOf } from "./ex8/solution";

const isString = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number => typeof value === "number";

describe("d18_guards_advanced", () => {
  test("ex1 - isNonEmpty() narrows to a tuple with a head", () => {
    const rows: number[] = [1, 2];
    if (isNonEmpty(rows)) {
      expectTypeOf(rows).toEqualTypeOf<[number, ...number[]]>();
      expectTypeOf(rows[0]).toEqualTypeOf<number>();
    }
    const names: string[] = [];
    if (isNonEmpty(names)) {
      expectTypeOf(names[0]).toEqualTypeOf<string>();
    }
  });

  test("ex2 - hasKey() puts the key into the type", () => {
    const payload: object = { total: 3 };
    if (hasKey(payload, "total")) {
      expectTypeOf(payload.total).toEqualTypeOf<unknown>();
    }
    const other: object = {};
    // @ts-expect-error - nothing has been proved about this object yet.
    other.total;
  });

  test("ex3 - isOneOf() narrows a string to the allowed union", () => {
    const permissions = ["read", "write"] as const;
    const raw: string = "read";
    if (isOneOf(permissions, raw)) {
      expectTypeOf(raw).toEqualTypeOf<"read" | "write">();
    }
    const levels = ["low", "high"] as const;
    const level: string = "low";
    if (isOneOf(levels, level)) {
      expectTypeOf(level).toEqualTypeOf<"low" | "high">();
    }
  });

  test("ex4 - assertRow() narrows for the rest of the scope", () => {
    const value: unknown = { id: "r1", amount: 12 };
    assertRow(value);
    expectTypeOf(value).toEqualTypeOf<Row>();
    expectTypeOf(value.amount).toEqualTypeOf<number>();
    expectTypeOf(value.id).toEqualTypeOf<string>();
  });

  test("ex5 - onlyKind() returns only the matching member type", () => {
    const tasks: Task[] = [];
    expectTypeOf(onlyKind(tasks, "email")).toEqualTypeOf<{ kind: "email"; to: string }[]>();
    expectTypeOf(onlyKind(tasks, "sms")).toEqualTypeOf<{ kind: "sms"; number: string }[]>();
    expectTypeOf(onlyKind(tasks, "push")).toEqualTypeOf<{ kind: "push"; token: string }[]>();
    // @ts-expect-error - fax is not one of the task kinds.
    onlyKind(tasks, "fax");
  });

  test("ex6 - isRecord() and isStringRecord() narrow to indexable types", () => {
    const value: unknown = { a: 1 };
    if (isRecord(value)) {
      expectTypeOf(value).toEqualTypeOf<Record<string, unknown>>();
      expectTypeOf(value.a).toEqualTypeOf<unknown>();
    }
    const other: unknown = { a: "x" };
    if (isStringRecord(other)) {
      expectTypeOf(other).toEqualTypeOf<Record<string, string>>();
      expectTypeOf(other.a).toEqualTypeOf<string>();
    }
  });

  test("ex7 - everyIs() returns a guard over the whole list", () => {
    const allStrings = everyIs(isString);
    const values: readonly unknown[] = ["a"];
    if (allStrings(values)) {
      expectTypeOf(values).toEqualTypeOf<readonly string[]>();
    }
    const allNumbers = everyIs(isNumber);
    const counts: readonly unknown[] = [1];
    if (allNumbers(counts)) {
      expectTypeOf(counts).toEqualTypeOf<readonly number[]>();
    }
  });

  test("ex8 - objectOf() derives the narrowed type from the shape", () => {
    const isUser = objectOf({ id: isString, age: isNumber });
    const value: unknown = { id: "u1", age: 30 };
    if (isUser(value)) {
      expectTypeOf(value).toEqualTypeOf<{ id: string; age: number }>();
      expectTypeOf(value.age).toEqualTypeOf<number>();
    }
    const isPoint = objectOf({ x: isNumber, y: isNumber });
    const point: unknown = { x: 1, y: 2 };
    if (isPoint(point)) {
      expectTypeOf(point).toEqualTypeOf<{ x: number; y: number }>();
    }
  });
});
