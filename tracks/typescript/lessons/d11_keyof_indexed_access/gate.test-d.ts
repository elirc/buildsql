// Type gate for typescript/d11_keyof_indexed_access. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { getValue } from "./ex1/solution";
import { setValue } from "./ex2/solution";
import { valuesOf } from "./ex3/solution";
import { sample } from "./ex4/solution";
import { pluckNested } from "./ex5/solution";
import type { Role, RoleLevel } from "./ex6/solution";
import { roleFor } from "./ex6/solution";
import { project } from "./ex7/solution";
import type { SortKey } from "./ex8/solution";
import { sortRows } from "./ex8/solution";

interface Row {
  id: string;
  name: string;
  secret: string;
}

interface Nested {
  id: string;
  user: { name: string; age: number };
}

const rows: Row[] = [{ id: "a", name: "Ada", secret: "x" }];
const nested: Nested[] = [{ id: "r1", user: { name: "Ada", age: 36 } }];

describe("d11_keyof_indexed_access", () => {
  test("ex1 - getValue() returns the type stored at the key", () => {
    expectTypeOf(getValue({ a: 1, b: "x" }, "a")).toEqualTypeOf<number>();
    expectTypeOf(getValue({ a: 1, b: "x" }, "b")).toEqualTypeOf<string>();
    // @ts-expect-error - c is not a key of this object.
    getValue({ a: 1 }, "c");
  });

  test("ex2 - setValue() takes a value of the key type and returns the whole object", () => {
    expectTypeOf(setValue({ a: 1, b: "x" }, "a", 2)).toEqualTypeOf<{ a: number; b: string }>();
    // @ts-expect-error - a holds numbers.
    setValue({ a: 1, b: "x" }, "a", "2");
  });

  test("ex3 - valuesOf() unions the value types", () => {
    expectTypeOf(valuesOf({ a: 1, b: 2 })).toEqualTypeOf<number[]>();
    expectTypeOf(valuesOf({ a: 1, b: "x" })).toEqualTypeOf<(number | string)[]>();
    // @ts-expect-error - a primitive has no members to collect.
    valuesOf(1);
  });

  test("ex4 - sample() indexes the array type by number", () => {
    expectTypeOf(sample([1, 2, 3], 0)).toEqualTypeOf<number | undefined>();
    const tuple = ["a", "b"] as const;
    expectTypeOf(sample(tuple, 0)).toEqualTypeOf<"a" | "b" | undefined>();
    // @ts-expect-error - the index is a number.
    sample([1, 2], "0");
  });

  test("ex5 - pluckNested() chains two indexed accesses", () => {
    expectTypeOf(pluckNested(nested, "user", "name")).toEqualTypeOf<string[]>();
    expectTypeOf(pluckNested(nested, "user", "age")).toEqualTypeOf<number[]>();
    // @ts-expect-error - the user has no nickname.
    pluckNested(nested, "user", "nickname");
  });

  test("ex6 - Role and RoleLevel are both derived from the table", () => {
    expectTypeOf<Role>().toEqualTypeOf<"admin" | "editor" | "viewer">();
    expectTypeOf<RoleLevel>().toEqualTypeOf<3 | 2 | 1>();
    expectTypeOf(roleFor(2)).toEqualTypeOf<Role>();
    // @ts-expect-error - there is no level 4.
    roleFor(4);
  });

  test("ex7 - project() returns a Pick of the named keys", () => {
    expectTypeOf(project(rows, ["id", "name"])).toEqualTypeOf<Pick<Row, "id" | "name">[]>();
    expectTypeOf(project(rows, ["id"])).toEqualTypeOf<Pick<Row, "id">[]>();
    // @ts-expect-error - nope is not a key of Row.
    project(rows, ["nope"]);
  });

  test("ex8 - SortKey names a real key of the row type", () => {
    expectTypeOf(sortRows(rows, [])).toEqualTypeOf<Row[]>();
    expectTypeOf<SortKey<Row>["key"]>().toEqualTypeOf<keyof Row>();
    expectTypeOf<SortKey<Row>["direction"]>().toEqualTypeOf<"asc" | "desc">();
    // @ts-expect-error - nope is not a key of Row.
    sortRows(rows, [{ key: "nope", direction: "asc" }]);
  });
});
