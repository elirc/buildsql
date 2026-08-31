// Gate for typescript/d06_narrowing_guards. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { isNonEmptyString } from "./ex1/solution";
import { kindOf } from "./ex2/solution";
import { isPoint } from "./ex3/solution";
import { assertIsRecord } from "./ex4/solution";
import { toMillis } from "./ex5/solution";
import { collectTags, isTag } from "./ex6/solution";
import { readConfig } from "./ex7/solution";
import { flattenText } from "./ex8/solution";

describe("d06_narrowing_guards", () => {
  test("ex1 - isNonEmptyString() accepts text and nothing else", () => {
    expect(isNonEmptyString("a"), "a real string passes").toBe(true);
    expect(isNonEmptyString(""), "the empty string is not text").toBe(false);
    expect(
      isNonEmptyString("   "),
      "and neither is a string of only whitespace - reread README ex1",
    ).toBe(false);
    expect(isNonEmptyString(1), "a number is not a string, however it prints").toBe(false);
    expect(isNonEmptyString(null), "null is not a string").toBe(false);
    expect(isNonEmptyString(undefined), "and neither is undefined").toBe(false);
    expect(isNonEmptyString(["a"]), "an array of one string is not a string").toBe(false);
  });

  test("ex2 - kindOf() labels every runtime shape", () => {
    expect(kindOf("a"), "a string is string").toBe("string");
    expect(kindOf(1), "a number is number").toBe("number");
    expect(kindOf(Number.NaN), "NaN is a number too - typeof does not lie about that").toBe(
      "number",
    );
    expect(kindOf(true), "a boolean is boolean").toBe("boolean");
    expect(kindOf(undefined), "undefined is undefined").toBe("undefined");
    expect(
      kindOf(null),
      "null gets its own label, because typeof null is object and that is a wart",
    ).toBe("null");
    expect(
      kindOf([1, 2]),
      "an array gets its own label, because typeof [] is also object",
    ).toBe("array");
    expect(kindOf({ a: 1 }), "a plain object is object").toBe("object");
    expect(kindOf(() => 1), "a function is function").toBe("function");
  });

  test("ex3 - isPoint() checks the shape, not the class", () => {
    expect(isPoint({ x: 1, y: 2 }), "two numeric members is a point").toBe(true);
    expect(
      isPoint({ x: 1, y: 2, label: "origin" }),
      "extra members are fine - structural typing asks what is there",
    ).toBe(true);
    expect(isPoint({ x: 1 }), "a missing member is not a point").toBe(false);
    expect(isPoint({ x: "1", y: 2 }), "a member of the wrong type is not a point").toBe(false);
    expect(
      isPoint(null),
      "null is the classic miss: typeof null is object, so check for it explicitly",
    ).toBe(false);
    expect(isPoint([1, 2]), "a pair of numbers in an array is not a point").toBe(false);
    expect(isPoint("1,2"), "and neither is a string that describes one").toBe(false);
  });

  test("ex4 - assertIsRecord() throws for anything that is not a plain object", () => {
    expect(() => assertIsRecord({}), "an empty object is a plain object").not.toThrow();
    expect(() => assertIsRecord({ a: 1 }), "so is one with members").not.toThrow();
    expect(() => assertIsRecord(null), "null is not, with that exact message").toThrow(
      "expected a plain object",
    );
    expect(
      () => assertIsRecord([]),
      "an array is not a plain object here, even though typeof says object",
    ).toThrow("expected a plain object");
    expect(() => assertIsRecord("x"), "a string is not a plain object").toThrow(
      "expected a plain object",
    );
    expect(() => assertIsRecord(undefined), "and neither is undefined").toThrow(
      "expected a plain object",
    );
  });

  test("ex5 - toMillis() narrows three unrelated members", () => {
    expect(toMillis(0), "a number is already milliseconds - even zero").toBe(0);
    expect(toMillis(1234), "and so is any other number").toBe(1234);
    expect(toMillis(new Date(1234)), "a Date is recognised with instanceof").toBe(1234);
    expect(toMillis("1234"), "a string of digits is a millisecond count").toBe(1234);
    expect(toMillis("  1234  "), "trimmed first").toBe(1234);
    expect(
      toMillis("2026-03-01T00:00:00.000Z"),
      "anything else is parsed as a date - ISO 8601 is the format the spec pins down",
    ).toBe(Date.UTC(2026, 2, 1));
    expect(
      () => toMillis("later"),
      "a string that is neither a count nor a date has to fail loudly",
    ).toThrow(/cannot read a timestamp/);
  });

  test("ex6 - isTag() lets filter() narrow the whole array", () => {
    expect(isTag({ name: "a", weight: 1 }), "the right shape passes").toBe(true);
    expect(isTag({ name: "a" }), "a missing weight fails").toBe(false);
    expect(isTag(null), "null fails").toBe(false);
    expect(
      collectTags([{ name: "a", weight: 1 }, null, "x", { name: "b", weight: 2 }]),
      "only the values that pass the guard survive, in input order",
    ).toEqual([
      { name: "a", weight: 1 },
      { name: "b", weight: 2 },
    ]);
    expect(collectTags([]), "nothing in, nothing out").toEqual([]);
    expect(collectTags([{ name: "a" }, 1, null]), "nothing passes, so an empty array").toEqual([]);
  });

  test("ex7 - readConfig() rejects the first bad field it finds", () => {
    expect(
      readConfig({ host: "localhost", port: 8080, tls: false }),
      "a valid config comes back as a Config",
    ).toEqual({ host: "localhost", port: 8080, tls: false });
    expect(
      readConfig({ host: "  localhost  ", port: 8080, tls: true, extra: "ignored" }),
      "the host is trimmed and unknown members are dropped, not copied",
    ).toEqual({ host: "localhost", port: 8080, tls: true });

    expect(() => readConfig(null), "null is not an object here").toThrow(
      "config: expected an object",
    );
    expect(() => readConfig([]), "and neither is an array").toThrow("config: expected an object");
    expect(() => readConfig("localhost"), "or a string").toThrow("config: expected an object");
    expect(
      () => readConfig({}),
      "the fields are checked in order, so an empty object fails on host first",
    ).toThrow("config: host must be a non-empty string");
    expect(() => readConfig({ host: "   ", port: 1, tls: true }), "a blank host fails").toThrow(
      "config: host must be a non-empty string",
    );
    expect(() => readConfig({ host: "h" }), "then the port").toThrow(
      "config: port must be a positive integer",
    );
    expect(() => readConfig({ host: "h", port: 0 }), "zero is not a port").toThrow(
      "config: port must be a positive integer",
    );
    expect(() => readConfig({ host: "h", port: 80.5 }), "and neither is a fraction").toThrow(
      "config: port must be a positive integer",
    );
    expect(() => readConfig({ host: "h", port: 80 }), "and finally tls").toThrow(
      "config: tls must be a boolean",
    );
  });

  test("ex8 - flattenText() walks a recursive union", () => {
    expect(flattenText("a"), "a bare string is itself").toBe("a");
    expect(flattenText("  a  "), "trimmed").toBe("a");
    expect(flattenText(7), "a number renders as text").toBe("7");
    expect(flattenText(0), "including zero, which is not an empty node").toBe("0");
    expect(
      flattenText(["a", ["b", 2], "c"]),
      "nested nodes flatten depth-first, joined by single spaces",
    ).toBe("a b 2 c");
    expect(flattenText([]), "an empty node list is an empty string").toBe("");
    expect(
      flattenText(["", "a", ["", ""], "b"]),
      "empty pieces contribute nothing at all - no double spaces (README ex8)",
    ).toBe("a b");
    expect(flattenText([[[["deep"]]]]), "depth is not limited").toBe("deep");
  });
});
