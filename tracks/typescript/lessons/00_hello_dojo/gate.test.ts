// Gate for typescript/00_hello_dojo. Quoted verbatim in README.md.
// One test per exercise; the test title starts with the exercise directory
// name so `dojo test typescript 00_hello_dojo ex2` can select just that one.
import { describe, expect, test } from "vitest";

import { greet } from "./ex1/solution";
import { describeTrack } from "./ex2/solution";
import { parseLessonNumber } from "./ex3/solution";

describe("00_hello_dojo", () => {
  test("ex1 - greet() builds a greeting from a name", () => {
    expect(
      greet("Eli"),
      'greet("Eli") must return exactly "Hello, Eli! Welcome to the dojo." - ' +
        "compare it character by character, punctuation included",
    ).toBe("Hello, Eli! Welcome to the dojo.");
    expect(
      greet("Ada"),
      "the name has to come from the parameter, not be hard-coded - reread README ex1",
    ).toBe("Hello, Ada! Welcome to the dojo.");
  });

  test("ex2 - describeTrack() agrees with its own number", () => {
    expect(
      describeTrack("typescript", 15),
      'describeTrack("typescript", 15) must return "typescript: 15 lessons"',
    ).toBe("typescript: 15 lessons");
    expect(
      describeTrack("react", 1),
      'one lesson is a "lesson", not "lessons" - the plural is a decision your ' +
        "code has to make, not a template literal you can write once",
    ).toBe("react: 1 lesson");
    expect(
      describeTrack("csharp", 0),
      "zero is plural in English: expect \"csharp: 0 lessons\"",
    ).toBe("csharp: 0 lessons");
  });

  test("ex3 - parseLessonNumber() returns a number, not a string", () => {
    expect(
      parseLessonNumber("07_generics_2"),
      'parseLessonNumber("07_generics_2") must return the number 7 - note "07" ' +
        "has a leading zero, and toBe uses ===, so the string \"07\" will not pass",
    ).toBe(7);
    expect(
      parseLessonNumber("00_hello_dojo"),
      'the first lesson is number 0, not NaN - what does Number.parseInt("00") give?',
    ).toBe(0);
    expect(
      typeof parseLessonNumber("11_async_and_modules"),
      "the runtime type must be 'number' - a string of digits is not a number",
    ).toBe("number");
  });
});
