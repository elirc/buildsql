// Runtime gate for typescript/d19_unknown_any_never. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { parseJson } from "./ex1/solution";
import { toNumber } from "./ex2/solution";
import { assertUnreachable, describeShipment } from "./ex3/solution";
import { createCache } from "./ex4/solution";
import { deepGet } from "./ex6/solution";
import { isJsonValue } from "./ex7/solution";
import { fail, requirePort } from "./ex8/solution";

const isNumber = (value: unknown): value is number => typeof value === "number";
const isString = (value: unknown): value is string => typeof value === "string";

describe("d19_unknown_any_never", () => {
  test("ex1 - parseJson() parses or throws", () => {
    expect(parseJson('{"a":1}'), "a valid object round-trips").toEqual({ a: 1 });
    expect(parseJson("null"), "the JSON null is the JavaScript null").toBe(null);
    expect(parseJson("[1,2]"), "arrays parse too").toEqual([1, 2]);
    expect(() => parseJson("{"), "invalid JSON throws rather than returning null - " +
      "swallowing the error is what buries the bug (README ex1)").toThrow();
  });

  test("ex2 - toNumber() converts only what it can defend", () => {
    expect(toNumber(3), "a finite number is itself").toBe(3);
    expect(toNumber(-2.5), "negatives and decimals included").toBe(-2.5);
    expect(toNumber(Number.NaN), "NaN is a number and is not a value").toBe(null);
    expect(toNumber(Number.POSITIVE_INFINITY), "and neither is Infinity").toBe(null);
    expect(toNumber("42"), "a numeric string converts").toBe(42);
    expect(toNumber("  7  "), "surrounding whitespace is trimmed first").toBe(7);
    expect(toNumber(""), "the empty string is not zero - Number() says it is, which " +
      "is the trap this exercise exists for (README ex2)").toBe(null);
    expect(toNumber("   "), "and neither is whitespace").toBe(null);
    expect(toNumber("abc"), "a non-numeric string is null").toBe(null);
    expect(toNumber(true), "a boolean is not a number here").toBe(null);
    expect(toNumber(null), "null is null").toBe(null);
    expect(toNumber({}), "and an object is too").toBe(null);
  });

  test("ex3 - describeShipment() covers every status", () => {
    expect(describeShipment({ status: "pending" }), "the waiting case").toBe("waiting to ship");
    expect(
      describeShipment({ status: "shipped", trackingId: "TR9" }),
      "the tracking id belongs in the sentence",
    ).toBe("in transit as TR9");
    expect(
      describeShipment({ status: "delivered", signedBy: "Ada" }),
      "and so does the signature",
    ).toBe("delivered to Ada");
    expect(
      describeShipment({ status: "cancelled", reason: "out of stock" }),
      "and the reason",
    ).toBe("cancelled: out of stock");
    expect(() => assertUnreachable("mystery" as never), "the runtime half of the " +
      "exhaustiveness check has to name the value it was surprised by").toThrow(/mystery/);
  });

  test("ex4 - createCache() only hands back what the guard accepts", () => {
    const cache = createCache();
    cache.set("count", 3);
    cache.set("name", "ada");
    expect(cache.get("count", isNumber), "stored as a number, read as a number").toBe(3);
    expect(cache.get("name", isString), "and the same for the string").toBe("ada");
    expect(cache.get("count", isString), "the wrong guard returns null rather than " +
      "the value - the cache is untyped inside, so the guard is the only proof").toBe(null);
    expect(cache.get("missing", isNumber), "an absent key is null").toBe(null);
    expect(cache.has("count"), "has() reports presence").toBe(true);
    expect(cache.has("missing"), "and absence").toBe(false);
    cache.set("count", 4);
    expect(cache.get("count", isNumber), "a second set overwrites").toBe(4);
  });

  test("ex6 - deepGet() walks a path through an unknown value", () => {
    const config: unknown = { server: { ports: [8080, 9090], name: "edge" } };
    expect(deepGet(config, ["server", "name"]), "two steps to a string").toBe("edge");
    expect(deepGet(config, ["server", "ports", "1"]), "array indices are string keys").toBe(9090);
    expect(deepGet(config, []), "an empty path is the value itself").toBe(config);
    expect(deepGet(config, ["server", "missing"]), "a missing key is undefined").toBe(undefined);
    expect(deepGet(config, ["server", "name", "nope"]), "walking into a string stops - " +
      "the walk must check the container at every step, not only the first").toBe(undefined);
    expect(deepGet(null, ["a"]), "null has no properties and is not a crash").toBe(undefined);
    expect(deepGet(undefined, ["a"]), "and neither does undefined").toBe(undefined);
  });

  test("ex7 - isJsonValue() accepts exactly what JSON can hold", () => {
    expect(isJsonValue({ a: [1, "x", null, { b: true }] }), "a nested document").toBe(true);
    expect(isJsonValue([]), "an empty array").toBe(true);
    expect(isJsonValue({}), "an empty object").toBe(true);
    expect(isJsonValue(0), "zero is a number").toBe(true);
    expect(isJsonValue(null), "null is a JSON value - the guard must not reject it " +
      "along with undefined (README ex7)").toBe(true);
    expect(isJsonValue(undefined), "undefined is not").toBe(false);
    expect(isJsonValue(Number.NaN), "NaN has no JSON spelling").toBe(false);
    expect(isJsonValue(() => 1), "a function is not data").toBe(false);
    expect(isJsonValue({ a: undefined }), "one bad value fails the whole document").toBe(false);
    expect(isJsonValue([1, () => 1]), "and that is true inside arrays too").toBe(false);
  });

  test("ex8 - requirePort() returns a port or never returns", () => {
    expect(requirePort(8080), "a valid port comes back as a number").toBe(8080);
    expect(requirePort("443"), "a numeric string is accepted").toBe(443);
    expect(requirePort("  22  "), "with whitespace trimmed").toBe(22);
    expect(() => requirePort(0), "0 is out of range").toThrow(/port/);
    expect(() => requirePort(70000), "and so is 70000").toThrow(/port/);
    expect(() => requirePort(80.5), "a port is an integer").toThrow(/port/);
    expect(() => requirePort("abc"), "a non-numeric string throws").toThrow(/port/);
    expect(() => requirePort(null), "and so does null").toThrow(/port/);
    expect(() => fail("boom"), "fail() throws the message it was given").toThrow(/boom/);
  });
});
