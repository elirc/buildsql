// Gate for typescript/d10_generic_constraints. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { sumOf } from "./ex1/solution";
import { replaceById } from "./ex2/solution";
import { tally } from "./ex3/solution";
import { withDefaults } from "./ex4/solution";
import { makeCache } from "./ex5/solution";
import { groupToMap } from "./ex6/solution";
import { deepMerge } from "./ex7/solution";
import { VersionedStore } from "./ex8/solution";

describe("d10_generic_constraints", () => {
  test("ex1 - sumOf() adds the amount of anything that has one", () => {
    expect(sumOf([{ amount: 2 }, { amount: 3 }]), "2 plus 3").toBe(5);
    expect(
      sumOf([
        { sku: "a", amount: 10, note: "x" },
        { sku: "b", amount: -4, note: "y" },
      ]),
      "extra members are none of this function business, and negatives count",
    ).toBe(6);
    expect(sumOf([]), "an empty list sums to 0, not to undefined").toBe(0);
    expect(sumOf([{ amount: 0 }]), "a zero amount is still an amount").toBe(0);
  });

  test("ex2 - replaceById() swaps in place or appends", () => {
    const items = [
      { id: "a", qty: 1 },
      { id: "b", qty: 2 },
      { id: "c", qty: 3 },
    ];
    expect(
      replaceById(items, { id: "b", qty: 99 }),
      "the replacement keeps the position the old item had",
    ).toEqual([
      { id: "a", qty: 1 },
      { id: "b", qty: 99 },
      { id: "c", qty: 3 },
    ]);
    expect(
      replaceById(items, { id: "d", qty: 4 }),
      "an id nobody has yet is appended at the end",
    ).toEqual([
      { id: "a", qty: 1 },
      { id: "b", qty: 2 },
      { id: "c", qty: 3 },
      { id: "d", qty: 4 },
    ]);
    expect(items[1].qty, "the list you were handed is not modified").toBe(2);
    expect(replaceById([], { id: "a", qty: 1 }), "an empty list gains its first item").toEqual([
      { id: "a", qty: 1 },
    ]);
  });

  test("ex3 - tally() reports every bucket, even the empty ones", () => {
    expect(
      tally(["a", "b"], ["a", "a", "c"]),
      "two a values, no b values, and the unlisted c is ignored",
    ).toEqual({ a: 2, b: 0 });
    expect(tally(["a"], []), "a bucket with nothing in it is still a bucket at 0").toEqual({
      a: 0,
    });
    expect(tally([], ["a"]), "no buckets means an empty object").toEqual({});
    expect(
      Object.keys(tally(["b", "a"], [])),
      "the buckets come out in the order they were declared",
    ).toEqual(["b", "a"]);
  });

  test("ex4 - withDefaults() lets the value win", () => {
    expect(
      withDefaults({ a: 1 }, { a: 9, b: 2 }),
      "the value overrides the default, and the default fills the gap",
    ).toEqual({ a: 1, b: 2 });
    expect(withDefaults({}, { b: 2 }), "with nothing supplied, every default applies").toEqual({
      b: 2,
    });
    expect(
      withDefaults({ a: 0 }, { a: 9 }),
      "zero is a supplied value: a spread respects it where || would not",
    ).toEqual({ a: 0 });
    const defaults = { a: 9 };
    withDefaults({ a: 1 }, defaults);
    expect(defaults.a, "neither argument is modified").toBe(9);
  });

  test("ex5 - makeCache() defaults its key type to string", () => {
    const scores = makeCache<number>();
    scores.set("ada", 90);
    expect(scores.get("ada"), "what went in comes back out").toBe(90);
    expect(scores.has("ada"), "has() reports a key that was set").toBe(true);
    expect(scores.has("nobody"), "and a key that was not").toBe(false);
    expect(
      scores.get("nobody"),
      "a missing key is undefined, which is why get() returns V or undefined",
    ).toBeUndefined();
    scores.set("ada", 95);
    expect(scores.get("ada"), "setting the same key again replaces the value").toBe(95);
    expect(scores.size(), "and does not grow the cache").toBe(1);

    const labels = makeCache<string, number>();
    labels.set(1, "one");
    expect(labels.get(1), "with both type arguments given, the keys are numbers").toBe("one");
    expect(labels.size(), "one entry").toBe(1);
    expect(scores.size(), "and two caches never share storage").toBe(1);
  });

  test("ex6 - groupToMap() keys a Map by a computed group", () => {
    const grouped = groupToMap(["a", "bb", "cc", "ddd"], (word) => word.length);
    expect(
      [...grouped.entries()],
      "one entry per group, each list in input order, groups in first-seen order",
    ).toEqual([
      [1, ["a"]],
      [2, ["bb", "cc"]],
      [3, ["ddd"]],
    ]);
    expect(grouped.get(2), "the group key is whatever the callback returned").toEqual([
      "bb",
      "cc",
    ]);
    expect([...groupToMap([], (value: string) => value).entries()], "no items, no groups").toEqual(
      [],
    );
    expect(
      [...groupToMap([1, 2, 3], (n) => (n % 2 === 0 ? "even" : "odd")).entries()],
      "a string group works exactly the same way",
    ).toEqual([
      ["odd", [1, 3]],
      ["even", [2]],
    ]);
  });

  test("ex7 - deepMerge() recurses into plain objects only", () => {
    expect(
      deepMerge({ a: { x: 1, y: 2 }, k: 1 }, { a: { y: 3, z: 4 }, m: 2 }),
      "nested plain objects merge key by key; everything else is replaced",
    ).toEqual({ a: { x: 1, y: 3, z: 4 }, k: 1, m: 2 });
    expect(
      deepMerge({ list: [1, 2] }, { list: [3] }),
      "an array REPLACES rather than merging - reread README ex7",
    ).toEqual({ list: [3] });
    expect(
      deepMerge({ a: { x: 1 } }, { a: null }),
      "null is a value, and it replaces the object that was there",
    ).toEqual({ a: null });
    expect(deepMerge({}, {}), "two empty objects merge to an empty object").toEqual({});
    expect(deepMerge({ only: 1 }, {}), "keys the second object lacks survive").toEqual({ only: 1 });

    const left = { a: { x: 1 } };
    const right = { a: { y: 2 } };
    deepMerge(left, right);
    expect(left.a, "neither input is modified, at any depth").toEqual({ x: 1 });
    expect(right.a, "including the nested objects of the second one").toEqual({ y: 2 });
  });

  test("ex8 - VersionedStore refuses stale writes", () => {
    const store = new VersionedStore<{ id: string; version: number; body: string }>();
    expect(store.put({ id: "a", version: 2, body: "second" }), "a brand new id is stored").toBe(
      true,
    );
    expect(
      store.put({ id: "a", version: 1, body: "first" }),
      "an older version is refused, and says so",
    ).toBe(false);
    expect(store.get("a"), "the newer body survives the stale write").toEqual({
      id: "a",
      version: 2,
      body: "second",
    });
    expect(
      store.put({ id: "a", version: 2, body: "again" }),
      "the SAME version is refused too - only strictly newer wins (README ex8)",
    ).toBe(false);
    expect(store.put({ id: "a", version: 3, body: "third" }), "a newer version is stored").toBe(
      true,
    );
    expect(store.get("a")?.body, "and replaces what was there").toBe("third");
    expect(store.get("nobody"), "an unknown id is undefined").toBeUndefined();

    store.put({ id: "c", version: 1, body: "c" });
    store.put({ id: "b", version: 1, body: "b" });
    expect(
      store.all().map((item) => item.id),
      "all() comes back sorted by id, whatever order things were written in",
    ).toEqual(["a", "b", "c"]);
    expect(store.size, "three ids").toBe(3);
    expect(new VersionedStore<{ id: string; version: number }>().all(), "a fresh store is empty").toEqual(
      [],
    );
  });
});
