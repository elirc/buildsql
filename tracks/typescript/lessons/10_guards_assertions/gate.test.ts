// Gate for typescript/10_guards_assertions. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { isLesson } from "./ex1/solution";
import { assertIsStringArray } from "./ex2/solution";
import { parseJson, readTitle } from "./ex3/solution";
import { describeSettings, settings } from "./ex4/solution";
import { validateSubmission } from "./challenge/solution";

describe("10_guards_assertions", () => {
  test("ex1 - isLesson() recognises the shape and rejects the rest", () => {
    expect(isLesson({ slug: "01_types", exercises: 4 }), "the right shape passes").toBe(true);
    expect(
      isLesson({ slug: "01_types", exercises: 4, extra: true }),
      "extra members are fine - structural typing asks what is there, not what is not",
    ).toBe(true);
    expect(isLesson({ slug: "01_types" }), "a missing member fails").toBe(false);
    expect(isLesson({ slug: 1, exercises: 4 }), "a member of the wrong type fails").toBe(false);
    expect(
      isLesson(null),
      "null is the classic miss: typeof null is 'object', so check for it explicitly",
    ).toBe(false);
    expect(isLesson("01_types"), "a string is not a lesson").toBe(false);
  });

  test("ex2 - assertIsStringArray() throws on anything else", () => {
    expect(() => assertIsStringArray(["a", "b"]), "an array of strings passes silently").not.toThrow();
    expect(
      () => assertIsStringArray([]),
      "an empty array passes: every one of its zero elements is a string",
    ).not.toThrow();
    expect(
      () => assertIsStringArray(["a", 1]),
      "one bad element is enough to fail, with that exact message",
    ).toThrow("expected an array of strings");
    expect(() => assertIsStringArray("a"), "a bare string is not an array of strings").toThrow(
      "expected an array of strings",
    );
  });

  test("ex3 - parseJson() and readTitle() handle data nobody typed", () => {
    expect(parseJson('{"title":"Unions"}'), "the parse itself is unchanged").toEqual({
      title: "Unions",
    });
    expect(readTitle(parseJson('{"title":"Unions"}')), "a string title comes back").toBe("Unions");
    expect(
      readTitle(parseJson('{"title":5}')),
      "a title that is not a string is not a title - return null",
    ).toBeNull();
    expect(readTitle(parseJson("{}")), "a missing title is null").toBeNull();
    expect(readTitle(null), "null in, null out - and no exception").toBeNull();
    expect(readTitle("Unions"), "a bare string has no title property").toBeNull();
  });

  test("ex4 - describeSettings() reads members that kept their own types", () => {
    expect(
      describeSettings(),
      "the label upper-cased, the retry count after an x, and the verbose suffix",
    ).toBe("NIGHTLY x3 (verbose)");
    expect(settings.retries, "satisfies changes types, not values").toBe(3);
  });

  test("challenge - validateSubmission() collects every problem", () => {
    expect(
      validateSubmission({ slug: "ex1", attempts: 2, passed: true }),
      "a valid submission comes back as the success variant",
    ).toEqual({ ok: true, value: { slug: "ex1", attempts: 2, passed: true } });
    expect(
      validateSubmission({ slug: 1, attempts: "two", passed: true }),
      "TWO problems means two messages, in the order the README lists them",
    ).toEqual({ ok: false, errors: ["slug must be a string", "attempts must be a number"] });
    expect(
      validateSubmission({}),
      "an empty object is missing all three members",
    ).toEqual({
      ok: false,
      errors: ["slug must be a string", "attempts must be a number", "passed must be a boolean"],
    });
    expect(
      validateSubmission("nope"),
      "a non-object fails with the single 'expected an object' message",
    ).toEqual({ ok: false, errors: ["expected an object"] });
    expect(
      validateSubmission(null),
      "and null takes the same path - typeof null is 'object', so it needs its own check",
    ).toEqual({ ok: false, errors: ["expected an object"] });
  });
});
