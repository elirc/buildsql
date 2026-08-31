// Runtime gate for typescript/d18_guards_advanced. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { isNonEmpty } from "./ex1/solution";
import { hasKey } from "./ex2/solution";
import { isOneOf } from "./ex3/solution";
import { assertRow } from "./ex4/solution";
import type { Task } from "./ex5/solution";
import { onlyKind } from "./ex5/solution";
import { isRecord, isStringRecord } from "./ex6/solution";
import { everyIs } from "./ex7/solution";
import { objectOf } from "./ex8/solution";

const isString = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number => typeof value === "number";

const tasks: Task[] = [
  { kind: "email", to: "ada@example.com" },
  { kind: "sms", number: "555-0100" },
  { kind: "email", to: "grace@example.com" },
  { kind: "push", token: "abc" },
];

describe("d18_guards_advanced", () => {
  test("ex1 - isNonEmpty() is true exactly when there is a first element", () => {
    expect(isNonEmpty([1]), "one element is not empty").toBe(true);
    expect(isNonEmpty([]), "an empty array has no first element").toBe(false);
    expect(isNonEmpty([undefined]), "a single undefined is still one element - " +
      "the guard counts entries, it does not judge them (README ex1)").toBe(true);
    expect(isNonEmpty(["a", "b"]), "two elements is also not empty").toBe(true);
  });

  test("ex2 - hasKey() looks at own properties only", () => {
    expect(hasKey({ total: 3 }, "total"), "the key is there").toBe(true);
    expect(hasKey({ total: 3 }, "missing"), "and this one is not").toBe(false);
    expect(hasKey({ total: undefined }, "total"), "a key whose value is undefined " +
      "is still a key - ask whether the property exists, not what it holds").toBe(true);
    const inherited = Object.create({ fromPrototype: 1 }) as object;
    expect(hasKey(inherited, "fromPrototype"), "an inherited property is not an own " +
      "property - the in operator would have said true here (README ex2)").toBe(false);
  });

  test("ex3 - isOneOf() checks membership in a list", () => {
    const permissions = ["read", "write"] as const;
    expect(isOneOf(permissions, "read"), "read is in the list").toBe(true);
    expect(isOneOf(permissions, "delete"), "delete is not").toBe(false);
    expect(isOneOf([], "read"), "an empty list allows nothing").toBe(false);
    expect(isOneOf(permissions, ""), "the empty string is not a permission either").toBe(false);
  });

  test("ex4 - assertRow() throws with the offending field named", () => {
    expect(() => assertRow({ id: "r1", amount: 12 }), "a valid row passes silently").not.toThrow();
    expect(() => assertRow({ id: 1, amount: 12 }), "the message has to name the field " +
      "that failed, so the learner reading the log knows where to look").toThrow(/id/);
    expect(() => assertRow({ id: "r1", amount: "12" }), "and the same for amount").toThrow(
      /amount/,
    );
    expect(() => assertRow(null), "null is not a row").toThrow();
    expect(() => assertRow([]), "and neither is an array").toThrow();
    expect(() => assertRow({ id: "r1" }), "a missing field is as bad as a wrong one").toThrow(
      /amount/,
    );
  });

  test("ex5 - onlyKind() keeps the matching members in order", () => {
    expect(onlyKind(tasks, "email"), "both email tasks, in input order").toEqual([
      { kind: "email", to: "ada@example.com" },
      { kind: "email", to: "grace@example.com" },
    ]);
    expect(onlyKind(tasks, "sms"), "one sms task").toEqual([
      { kind: "sms", number: "555-0100" },
    ]);
    expect(onlyKind([], "email"), "no tasks means no matches, not a crash").toEqual([]);
    expect(onlyKind(tasks, "email").length, "filtering does not mutate the input").toBe(2);
    expect(tasks.length, "and the original list still has all four").toBe(4);
  });

  test("ex6 - isRecord() and isStringRecord() agree about what an object is", () => {
    expect(isRecord({ a: 1 }), "a plain object is a record").toBe(true);
    expect(isRecord({}), "including an empty one").toBe(true);
    expect(isRecord(null), "typeof null is object, which is the oldest trap in " +
      "JavaScript - the guard has to rule it out explicitly (README ex6)").toBe(false);
    expect(isRecord([1, 2]), "an array is not a record here").toBe(false);
    expect(isRecord("a"), "and neither is a string").toBe(false);
    expect(isStringRecord({ a: "x", b: "y" }), "every value is a string").toBe(true);
    expect(isStringRecord({}), "an empty record vacuously has only string values").toBe(true);
    expect(isStringRecord({ a: "x", b: 1 }), "one non-string value fails the whole check").toBe(
      false,
    );
    expect(isStringRecord(null), "and it inherits the null case from isRecord").toBe(false);
  });

  test("ex7 - everyIs() lifts a guard over a list", () => {
    const allStrings = everyIs(isString);
    expect(allStrings(["a", "b"]), "every element is a string").toBe(true);
    expect(allStrings(["a", 1]), "one number spoils it").toBe(false);
    expect(allStrings([]), "an empty list passes vacuously - every() on nothing is " +
      "true, and that is the behaviour the prompt asks for (README ex7)").toBe(true);
    const allNumbers = everyIs(isNumber);
    expect(allNumbers([1, 2, 3]), "the same combinator with a different guard").toBe(true);
    expect(allNumbers([1, "2"]), "and it is still strict").toBe(false);
  });

  test("ex8 - objectOf() builds a guard out of a shape", () => {
    const isUser = objectOf({ id: isString, age: isNumber });
    expect(isUser({ id: "u1", age: 30 }), "both fields match their guards").toBe(true);
    expect(isUser({ id: "u1", age: "30" }), "a wrong field type fails").toBe(false);
    expect(isUser({ id: "u1" }), "a missing field fails").toBe(false);
    expect(isUser({ id: "u1", age: 30, extra: true }), "extra keys are allowed - the " +
      "guard checks the shape it was given and ignores the rest (README ex8)").toBe(true);
    expect(isUser(null), "null is not an object").toBe(false);
    expect(isUser([]), "and an array is not one either").toBe(false);
    const isEmpty = objectOf({});
    expect(isEmpty({ anything: 1 }), "an empty shape accepts any object").toBe(true);
    expect(isEmpty("nope"), "but still not a string").toBe(false);
  });
});
