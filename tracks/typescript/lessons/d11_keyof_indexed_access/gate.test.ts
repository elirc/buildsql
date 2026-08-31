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
