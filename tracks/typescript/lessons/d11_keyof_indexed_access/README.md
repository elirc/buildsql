# d11 - keyof and indexed access (drill set)

Eight problems on the two operators that let a generic function talk about the
*members* of a type: `keyof T` for its keys and `T[K]` for what lives at one.
They drill lesson **07_generics_2**; go back there if `K extends keyof T` still
looks like noise.

**Most stubs here return `unknown`** where they should return `T[K]`,
`T[keyof T]` or a `Pick`. Reconnecting the result to the input is the exercise.

## ex1 - read one member

`getValue(source, key)` returns whatever lives at that key, typed. Passing a key
the object does not have is a compile error.

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d11_keyof_indexed_access ex1
```

## ex2 - write one member, immutably

`setValue(source, key, value)` returns a **new** object with that one member
replaced. `value` has to be of the type that key holds, and the source is never
modified.

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d11_keyof_indexed_access ex2
```

## ex3 - collect the values

`valuesOf(source)` returns `T[keyof T][]` - every value, in key order.
`{ a: 1, b: "x" }` gives `(number | string)[]`.

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d11_keyof_indexed_access ex3
```

## ex4 - index an array type

`sample(values, index)` returns `T[number] | undefined`. A negative index counts
back from the end; anything out of range, and any fractional index, is
`undefined`.

- `sample([1, 2, 3], -1)` -> `3`, `sample([1, 2, 3], 3)` -> `undefined`
- with a `readonly ["a", "b"]` tuple the result type is `"a" | "b" | undefined`

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d11_keyof_indexed_access ex4
```

## ex5 - two levels of indexed access

`pluckNested(items, outer, inner)` returns `T[K][I][]` - one value per row,
read from `row[outer][inner]`.

- `pluckNested(rows, "user", "name")` -> the names, typed `string[]`

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d11_keyof_indexed_access ex5
```

## ex6 - a table read both ways

`ROLES` is `{ admin: 3, editor: 2, viewer: 1 } as const`. Derive both:

- `Role` = `keyof typeof ROLES`
- `RoleLevel` = `(typeof ROLES)[Role]` - the union of the **values**

Then `roleFor(level)` finds the role with that level, and `atLeastRole(role,
min)` compares two roles through the table.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d11_keyof_indexed_access ex6
```

## ex7 - select columns

`project(rows, keys)` returns `Pick<T, K>[]` - one object per row containing
only the named members, in the order the keys were given. No keys means one
empty object per row.

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d11_keyof_indexed_access ex7
```

## ex8 - sort by several keys

`SortKey<T>` is `{ key: keyof T; direction: "asc" | "desc" }`, and
`sortRows(rows, by)` sorts a copy by each key in turn. Numbers compare
numerically, everything else compares as text, and the sort is **stable**, so
rows that tie on every key keep their input order.

Edit `ex8/solution.ts`, where `SortKey` will accept any string as a key.

```
uv run dojo test typescript d11_keyof_indexed_access ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/d11_keyof_indexed_access. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { getValue } from "./ex1/solution";
import { setValue } from "./ex2/solution";
import { valuesOf } from "./ex3/solution";
import { sample } from "./ex4/solution";
import { pluckNested } from "./ex5/solution";
import { ROLES, atLeastRole, roleFor } from "./ex6/solution";
import { project } from "./ex7/solution";
import { sortRows } from "./ex8/solution";

const staff = [
  { name: "Ada", dept: "eng", salary: 120 },
  { name: "Eli", dept: "ops", salary: 90 },
  { name: "Grace", dept: "eng", salary: 140 },
  { name: "Zoe", dept: "eng", salary: 120 },
];

describe("d11_keyof_indexed_access", () => {
  test("ex1 - getValue() reads one named member", () => {
    const item = { id: "a", qty: 3, active: true };
    expect(getValue(item, "qty"), "the value stored at qty").toBe(3);
    expect(getValue(item, "id"), "and at id").toBe("a");
    expect(getValue(item, "active"), "false-y or not, the value is the value").toBe(true);
    expect(getValue({ nested: { deep: 1 } }, "nested"), "objects come back whole").toEqual({
      deep: 1,
    });
  });

  test("ex2 - setValue() copies instead of assigning", () => {
    const item = { a: 1, b: "x" };
    const updated = setValue(item, "a", 2);
    expect(updated, "the named member is replaced, the rest copied").toEqual({ a: 2, b: "x" });
    expect(item.a, "the object you were handed is untouched - reread README ex2").toBe(1);
    expect(updated, "and the result is a different object").not.toBe(item);
    expect(setValue(item, "b", "y"), "any member can be set, not just the first").toEqual({
      a: 1,
      b: "y",
    });
  });

  test("ex3 - valuesOf() collects the values, in key order", () => {
    expect(valuesOf({ a: 1, b: 2 }), "two values, in declaration order").toEqual([1, 2]);
    expect(valuesOf({ x: "a", y: 1 }), "mixed value types come out as they went in").toEqual([
      "a",
      1,
    ]);
    expect(valuesOf({}), "an empty object has no values, and that is []").toEqual([]);
    expect(valuesOf({ b: 1, a: 2 }), "insertion order, not alphabetical order").toEqual([1, 2]);
  });

  test("ex4 - sample() indexes from either end", () => {
    expect(sample([1, 2, 3], 1), "index 1 is the second element").toBe(2);
    expect(sample([1, 2, 3], 0), "index 0 is the first").toBe(1);
    expect(sample([1, 2, 3], -1), "a negative index counts back from the end").toBe(3);
    expect(sample([1, 2, 3], -3), "and -3 reaches the first element").toBe(1);
    expect(sample([1, 2, 3], 3), "one past the end is undefined, not a crash").toBeUndefined();
    expect(sample([1, 2, 3], -4), "and one before the start is too").toBeUndefined();
    expect(sample([], 0), "an empty list has nothing at any index").toBeUndefined();
    expect(
      sample([1, 2, 3], 1.5),
      "a fractional index is not an index - reread README ex4",
    ).toBeUndefined();
  });

  test("ex5 - pluckNested() reaches one level in", () => {
    const rows = [
      { id: "r1", user: { name: "Ada", age: 36 } },
      { id: "r2", user: { name: "Eli", age: 41 } },
    ];
    expect(pluckNested(rows, "user", "name"), "the inner names, in row order").toEqual([
      "Ada",
      "Eli",
    ]);
    expect(pluckNested(rows, "user", "age"), "and the inner ages, as numbers").toEqual([36, 41]);
    expect(
      pluckNested([], "user" as never, "name" as never),
      "no rows means no values",
    ).toEqual([]);
  });

  test("ex6 - the role table works in both directions", () => {
    expect(ROLES.admin, "as const changed the types, not the numbers").toBe(3);
    expect(roleFor(3), "3 is the admin level").toBe("admin");
    expect(roleFor(2), "2 is the editor level").toBe("editor");
    expect(roleFor(1), "1 is the viewer level").toBe("viewer");
    expect(atLeastRole("admin", "editor"), "an admin clears an editor requirement").toBe(true);
    expect(atLeastRole("viewer", "editor"), "a viewer does not").toBe(false);
    expect(
      atLeastRole("editor", "editor"),
      "at least means at least - the same role passes",
    ).toBe(true);
  });

  test("ex7 - project() keeps only the named members", () => {
    const rows = [
      { id: "a", name: "Ada", secret: "x" },
      { id: "b", name: "Eli", secret: "y" },
    ];
    expect(project(rows, ["id", "name"]), "two keys in, two members per row out").toEqual([
      { id: "a", name: "Ada" },
      { id: "b", name: "Eli" },
    ]);
    expect(
      Object.keys(project(rows, ["name", "id"])[0]),
      "the members appear in the order the keys were given",
    ).toEqual(["name", "id"]);
    expect(project(rows, []), "no keys means one empty object per row").toEqual([{}, {}]);
    expect(project([], ["id"] as never), "no rows means no output").toEqual([]);
    expect(rows[0].secret, "the source rows are never modified").toBe("x");
  });

  test("ex8 - sortRows() sorts by several keys in order", () => {
    expect(
      sortRows(staff, [
        { key: "dept", direction: "asc" },
        { key: "salary", direction: "desc" },
      ]).map((row) => row.name),
      "department first, then salary descending inside each department - and Ada " +
        "stays ahead of Zoe because the sort is stable (README ex8)",
    ).toEqual(["Grace", "Ada", "Zoe", "Eli"]);
    expect(
      sortRows(staff, [{ key: "name", direction: "desc" }]).map((row) => row.name),
      "one key is enough",
    ).toEqual(["Zoe", "Grace", "Eli", "Ada"]);
    expect(
      sortRows(staff, []).map((row) => row.name),
      "no keys at all leaves the order alone",
    ).toEqual(["Ada", "Eli", "Grace", "Zoe"]);
    expect(
      staff.map((row) => row.name),
      "the input array is not sorted in place",
    ).toEqual(["Ada", "Eli", "Grace", "Zoe"]);
    expect(sortRows([], []), "no rows sorts to no rows").toEqual([]);
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
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
```

An exercise is green only when both gates agree about it.
