// Gate for typescript/i3_interview_rapidfire. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { toNumber } from "./ex1/solution";
import { levelBadge } from "./ex2/solution";
import { sortByKey } from "./ex3/solution";
import { compact } from "./ex4/solution";
import { ROUTES, describeRoute } from "./review1/solution";

describe("i3_interview_rapidfire", () => {
  test("ex1 - toNumber() narrows unknown into a number or null", () => {
    expect(toNumber(42), "a finite number comes back as itself").toBe(42);
    expect(toNumber("42"), "a numeric string parses").toBe(42);
    expect(toNumber("3.5"), "decimals too").toBe(3.5);
    expect(toNumber(""), "an empty string is not a number - Number('') is 0, which is the trap").toBeNull();
    expect(toNumber("   "), "and neither is whitespace").toBeNull();
    expect(toNumber("abc"), "a non-numeric string is null, not NaN").toBeNull();
    expect(toNumber(Number.NaN), "NaN is a number to typeof and not one here").toBeNull();
    expect(toNumber(null), "null, undefined, objects: all null").toBeNull();
    expect(toNumber({ value: 1 }), "an object is not a number").toBeNull();
  });

  test("ex2 - levelBadge() covers all four levels", () => {
    expect(levelBadge("beginner"), "one star").toBe("*");
    expect(levelBadge("intermediate"), "two stars").toBe("**");
    expect(
      levelBadge("advanced"),
      "three stars - the shipped code returns '?' because of a catch-all default",
    ).toBe("***");
    expect(levelBadge("master"), "four stars, and the default should now be unreachable").toBe(
      "****",
    );
  });

  test("ex3 - sortByKey() sorts a copy by a named property", () => {
    const learners = [
      { name: "Grace", streak: 3 },
      { name: "Ada", streak: 12 },
      { name: "Eli", streak: 7 },
    ];
    expect(
      sortByKey(learners, "streak").map((l) => l.name),
      "ascending by streak: Grace(3), Eli(7), Ada(12)",
    ).toEqual(["Grace", "Eli", "Ada"]);
    expect(
      sortByKey(learners, "name").map((l) => l.name),
      "strings compare alphabetically with the same comparator",
    ).toEqual(["Ada", "Eli", "Grace"]);
    expect(
      learners.map((l) => l.name),
      "the input array is untouched - sort() mutates, so copy first",
    ).toEqual(["Grace", "Ada", "Eli"]);
  });

  test("ex4 - compact() drops null and undefined", () => {
    expect(
      compact([1, null, 2, undefined, 3]),
      "only null and undefined go; everything else stays, in order",
    ).toEqual([1, 2, 3]);
    expect(
      compact([0, "", false, null]),
      "falsy is not the same question as nullish - 0, '' and false all survive",
    ).toEqual([0, "", false]);
    expect(compact([]), "an empty list stays empty").toEqual([]);
  });

  test("review1 - describeRoute() reads the frozen route table", () => {
    expect(describeRoute("listLessons"), "method, a space, then the path").toBe("GET /lessons");
    expect(describeRoute("submitAttempt"), "and the other one").toBe("POST /attempts");
    expect(ROUTES.listLessons.path, "as const changed types, not values").toBe("/lessons");
  });
});
